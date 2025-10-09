/**
 * API Route for Feedback Submission
 * Posts feedback to Slack or Linear based on configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'love'
  message: string
  rating: number
  email?: string
  userId?: string
  userName?: string
  userAgent: string
  url: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const feedbackData: FeedbackData = await request.json()

    // Validate required fields
    if (!feedbackData.message || !feedbackData.type) {
      return NextResponse.json(
        { success: false, message: 'Message and type are required' },
        { status: 400 }
      )
    }

    // Prepare feedback payload
    const payload = {
      ...feedbackData,
      userId: session?.user?.id || 'anonymous',
      userName: session?.user?.name || feedbackData.userName || 'Anonymous',
      email: feedbackData.email || session?.user?.email || 'no-email',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Send to configured service
    const service = process.env['FEEDBACK_SERVICE'] || 'slack' // 'slack' or 'linear'
    
    let success = false
    let serviceResponse = null

    if (service === 'slack') {
      serviceResponse = await sendToSlack(payload)
      success = !!serviceResponse
    } else if (service === 'linear') {
      serviceResponse = await sendToLinear(payload)
      success = !!serviceResponse
    }

    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to submit feedback' },
        { status: 500 }
      )
    }

    // Log feedback for analytics
    console.log('Feedback submitted:', {
      type: payload.type,
      rating: payload.rating,
      userId: payload.userId,
      timestamp: payload.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: serviceResponse?.id || Date.now().toString(),
        service,
        timestamp: payload.timestamp
      }
    })

  } catch (error: any) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendToSlack(payload: FeedbackData & { userId: string; userName: string; environment: string }) {
  const webhookUrl = process.env['SLACK_FEEDBACK_WEBHOOK_URL']
  
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured')
    return null
  }

  const emoji = {
    bug: '🐛',
    feature: '💡',
    general: '💬',
    love: '❤️'
  }[payload.type]

  const color = {
    bug: '#ff0000',
    feature: '#0066cc',
    general: '#36a64f',
    love: '#ff69b4'
  }[payload.type]

  const stars = '⭐'.repeat(payload.rating)

  const slackMessage = {
    text: `${emoji} New ${payload.type} feedback from PawfectMatch`,
    attachments: [
      {
        color,
        fields: [
          {
            title: 'Type',
            value: payload.type.charAt(0).toUpperCase() + payload.type.slice(1),
            short: true
          },
          {
            title: 'Rating',
            value: stars,
            short: true
          },
          {
            title: 'User',
            value: `${payload.userName} (${payload.email})`,
            short: true
          },
          {
            title: 'Environment',
            value: payload.environment,
            short: true
          },
          {
            title: 'Message',
            value: payload.message,
            short: false
          },
          {
            title: 'URL',
            value: payload.url,
            short: false
          }
        ],
        footer: 'PawfectMatch Feedback System',
        ts: Math.floor(new Date(payload.timestamp).getTime() / 1000)
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    return { id: `slack-${Date.now()}`, success: true }
  } catch (error) {
    console.error('Failed to send to Slack:', error)
    return null
  }
}

async function sendToLinear(payload: FeedbackData & { userId: string; userName: string; environment: string }) {
  const linearApiKey = process.env['LINEAR_API_KEY']
  const linearTeamId = process.env['LINEAR_TEAM_ID']
  
  if (!linearApiKey || !linearTeamId) {
    console.warn('Linear API key or team ID not configured')
    return null
  }

  const title = `${payload.type.charAt(0).toUpperCase() + payload.type.slice(1)}: ${payload.message.substring(0, 100)}${payload.message.length > 100 ? '...' : ''}`
  
  const description = `
**Rating:** ${'⭐'.repeat(payload.rating)}

**User:** ${payload.userName} (${payload.email})
**Environment:** ${payload.environment}
**URL:** ${payload.url}
**User Agent:** ${payload.userAgent}

**Message:**
${payload.message}

---
*Submitted via PawfectMatch Feedback Widget*
  `.trim()

  const linearPayload = {
    title,
    description,
    teamId: linearTeamId,
    priority: payload.type === 'bug' ? 2 : 3, // High priority for bugs
    labels: [
      { name: 'feedback' },
      { name: payload.type },
      { name: `rating-${payload.rating}` }
    ]
  }

  try {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${linearApiKey}`
      },
      body: JSON.stringify({
        query: `
          mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                title
              }
            }
          }
        `,
        variables: {
          input: linearPayload
        }
      })
    })

    const result = await response.json()

    if (!response.ok || !result.data?.issueCreate?.success) {
      throw new Error(`Linear API error: ${JSON.stringify(result)}`)
    }

    return { 
      id: result.data.issueCreate.issue.id,
      identifier: result.data.issueCreate.issue.identifier,
      success: true 
    }
  } catch (error) {
    console.error('Failed to send to Linear:', error)
    return null
  }
}
