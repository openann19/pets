/**
 * Daily Discoveries Email Digest Service
 * Sends personalized pet discovery emails to keep users engaged
 */

const sgMail = require('@sendgrid/mail')
const cron = require('node-cron')
const { logger } = require('../utils/logger')
const User = require('../models/User')
const Pet = require('../models/Pet')

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

class EmailDigestService {
  constructor() {
    this.isRunning = false
    this.scheduledJob = null
  }

  /**
   * Start the daily email digest cron job
   */
  start() {
    if (this.isRunning) {
      logger.warn('Email digest service is already running')
      return
    }

    // Schedule daily emails at 9 AM
    this.scheduledJob = cron.schedule('0 9 * * *', async () => {
      try {
        await this.sendDailyDigests()
      } catch (error) {
        logger.error('Daily digest cron job failed', error)
      }
    }, {
      scheduled: true,
      timezone: 'America/New_York'
    })

    this.isRunning = true
    logger.info('Email digest service started - daily emails at 9 AM')
  }

  /**
   * Stop the email digest service
   */
  stop() {
    if (this.scheduledJob) {
      this.scheduledJob.stop()
      this.scheduledJob = null
    }
    this.isRunning = false
    logger.info('Email digest service stopped')
  }

  /**
   * Send daily digest emails to all eligible users
   */
  async sendDailyDigests() {
    try {
      logger.info('Starting daily digest email process')

      // Get users who haven't been active in the last 24 hours
      const inactiveUsers = await this.getInactiveUsers()
      logger.info(`Found ${inactiveUsers.length} inactive users for daily digest`)

      let successCount = 0
      let errorCount = 0

      for (const user of inactiveUsers) {
        try {
          await this.sendUserDigest(user)
          successCount++
        } catch (error) {
          logger.error(`Failed to send digest to user ${user._id}`, error)
          errorCount++
        }
      }

      logger.info('Daily digest process completed', {
        total: inactiveUsers.length,
        success: successCount,
        errors: errorCount
      })

    } catch (error) {
      logger.error('Daily digest process failed', error)
      throw error
    }
  }

  /**
   * Get users who are eligible for daily digest emails
   */
  async getInactiveUsers() {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    return await User.find({
      isEmailVerified: true,
      emailDigestEnabled: { $ne: false }, // Default to true
      lastActive: { $lt: yesterday },
      'preferences.emailNotifications': { $ne: false }
    }).limit(1000) // Limit to prevent overwhelming
  }

  /**
   * Send personalized digest to a specific user
   */
  async sendUserDigest(user) {
    try {
      // Get user's pets
      const userPets = await Pet.find({ ownerId: user._id, isActive: true })
      
      if (userPets.length === 0) {
        logger.debug(`Skipping user ${user._id} - no active pets`)
        return
      }

      // Get recommended pets for each user pet
      const recommendedPets = await this.getRecommendedPets(user, userPets)
      
      if (recommendedPets.length === 0) {
        logger.debug(`Skipping user ${user._id} - no recommended pets`)
        return
      }

      // Generate email content
      const emailContent = this.generateEmailContent(user, userPets, recommendedPets)
      
      // Send email
      await this.sendEmail(user.email, emailContent)
      
      // Update user's last digest sent timestamp
      await User.findByIdAndUpdate(user._id, {
        lastDigestSent: new Date()
      })

      logger.info(`Daily digest sent to user ${user._id}`)

    } catch (error) {
      logger.error(`Failed to send digest to user ${user._id}`, error)
      throw error
    }
  }

  /**
   * Get recommended pets for user's pets
   */
  async getRecommendedPets(user, userPets) {
    const recommendedPets = []

    for (const userPet of userPets) {
      // Get pets within user's preferred distance
      const maxDistance = user.preferences?.maxDistance || 25
      
      const nearbyPets = await Pet.find({
        _id: { $ne: userPet._id },
        ownerId: { $ne: user._id },
        isActive: true,
        species: userPet.species,
        // Add location-based filtering if available
        // location: { $near: { $geometry: userPet.location, $maxDistance: maxDistance * 1609.34 } }
      }).limit(5)

      recommendedPets.push(...nearbyPets)
    }

    // Remove duplicates and limit to 5 total
    const uniquePets = recommendedPets.filter((pet, index, self) => 
      index === self.findIndex(p => p._id.toString() === pet._id.toString())
    ).slice(0, 5)

    return uniquePets
  }

  /**
   * Generate email content
   */
  generateEmailContent(user, userPets, recommendedPets) {
    const userName = user.firstName || 'Pet Parent'
    const userPetNames = userPets.map(pet => pet.name).join(', ')
    
    const subject = `🐾 Daily Discoveries: ${recommendedPets.length} new pets near ${userPetNames}!`
    
    const htmlContent = this.generateHTMLContent(userName, userPets, recommendedPets)
    const textContent = this.generateTextContent(userName, userPets, recommendedPets)

    return {
      subject,
      html: htmlContent,
      text: textContent
    }
  }

  /**
   * Generate HTML email content
   */
  generateHTMLContent(userName, userPets, recommendedPets) {
    const userPetNames = userPets.map(pet => pet.name).join(', ')
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Discoveries - PawfectMatch</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .pet-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0; background: #f9fafb; }
        .pet-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; float: left; margin-right: 15px; }
        .pet-info h3 { margin: 0 0 10px 0; color: #1f2937; }
        .pet-details { color: #6b7280; font-size: 14px; margin: 5px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .clearfix::after { content: ""; display: table; clear: both; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 Daily Discoveries</h1>
            <p>Hi ${userName}! We found ${recommendedPets.length} new pets near ${userPetNames}</p>
        </div>
        
        <div class="content">
            <h2>Meet Your Potential Matches</h2>
            <p>Here are some amazing pets that could be perfect companions for ${userPetNames}:</p>
            
            ${recommendedPets.map(pet => `
                <div class="pet-card clearfix">
                    <img src="${pet.photos?.[0] || '/images/default-pet.jpg'}" alt="${pet.name}" class="pet-photo">
                    <div class="pet-info">
                        <h3>${pet.name}</h3>
                        <div class="pet-details">${pet.breed} • ${pet.age} years old • ${pet.gender === 'male' ? '♂' : '♀'}</div>
                        <div class="pet-details">${pet.size} • ${pet.location || 'Near you'}</div>
                        ${pet.bio ? `<p style="margin: 10px 0; font-style: italic;">"${pet.bio}"</p>` : ''}
                    </div>
                </div>
            `).join('')}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL}/swipe" class="cta-button">Start Swiping Now</a>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">💡 Pro Tip</h3>
                <p>Complete your pet's profile with more photos and personality traits to get better matches!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>You're receiving this because you have email notifications enabled.</p>
            <p><a href="${process.env.CLIENT_URL}/settings/notifications">Manage your email preferences</a></p>
            <p>PawfectMatch - Where pets find their perfect matches</p>
        </div>
    </div>
</body>
</html>
    `
  }

  /**
   * Generate text email content
   */
  generateTextContent(userName, userPets, recommendedPets) {
    const userPetNames = userPets.map(pet => pet.name).join(', ')
    
    let text = `🐾 Daily Discoveries - PawfectMatch\n\n`
    text += `Hi ${userName}!\n\n`
    text += `We found ${recommendedPets.length} new pets near ${userPetNames}:\n\n`
    
    recommendedPets.forEach((pet, index) => {
      text += `${index + 1}. ${pet.name}\n`
      text += `   ${pet.breed} • ${pet.age} years old • ${pet.gender === 'male' ? '♂' : '♀'}\n`
      text += `   ${pet.size} • ${pet.location || 'Near you'}\n`
      if (pet.bio) {
        text += `   "${pet.bio}"\n`
      }
      text += `\n`
    })
    
    text += `Start swiping now: ${process.env.CLIENT_URL}/swipe\n\n`
    text += `Manage your email preferences: ${process.env.CLIENT_URL}/settings/notifications\n\n`
    text += `PawfectMatch - Where pets find their perfect matches`
    
    return text
  }

  /**
   * Send email using SendGrid
   */
  async sendEmail(to, content) {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@pawfectmatch.com',
        name: 'PawfectMatch'
      },
      subject: content.subject,
      text: content.text,
      html: content.html,
      categories: ['daily-digest', 'engagement'],
      customArgs: {
        type: 'daily_digest',
        timestamp: new Date().toISOString()
      }
    }

    await sgMail.send(msg)
  }

  /**
   * Send test email
   */
  async sendTestEmail(userEmail) {
    const testPets = [
      {
        name: 'Bella',
        breed: 'Golden Retriever',
        age: 3,
        gender: 'female',
        size: 'large',
        location: 'San Francisco, CA',
        bio: 'Friendly and energetic, loves playing fetch!',
        photos: ['/images/test-dog-1.jpg']
      },
      {
        name: 'Max',
        breed: 'Labrador',
        age: 2,
        gender: 'male',
        size: 'large',
        location: 'San Francisco, CA',
        bio: 'Gentle giant who loves cuddles and walks.',
        photos: ['/images/test-dog-2.jpg']
      }
    ]

    const testUser = {
      firstName: 'Test User',
      email: userEmail
    }

    const testUserPets = [
      {
        name: 'Luna',
        breed: 'Border Collie',
        age: 4
      }
    ]

    const emailContent = this.generateEmailContent(testUser, testUserPets, testPets)
    await this.sendEmail(userEmail, emailContent)
  }
}

// Create singleton instance
const emailDigestService = new EmailDigestService()

module.exports = emailDigestService
