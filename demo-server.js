/**
 * PawfectMatch Demo Server
 * Simple showcase of the implemented features
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Demo data
const demoData = {
  pets: [
    {
      id: 1,
      name: "Buddy",
      age: 3,
      breed: "Golden Retriever",
      photos: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"],
      bio: "Friendly and energetic golden retriever who loves playing fetch and meeting new friends!",
      distance: 2.5,
      compatibility: 95,
      isVerified: true,
      tags: ["Friendly", "Energetic", "Playful"]
    },
    {
      id: 2,
      name: "Luna",
      age: 2,
      breed: "Persian Cat",
      photos: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400"],
      bio: "Elegant Persian cat who enjoys quiet moments and gentle pets. Perfect for a calm household.",
      distance: 1.8,
      compatibility: 88,
      isVerified: true,
      tags: ["Calm", "Elegant", "Affectionate"]
    },
    {
      id: 3,
      name: "Max",
      age: 4,
      breed: "German Shepherd",
      photos: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"],
      bio: "Loyal German Shepherd looking for an active family. Great with kids and loves adventures!",
      distance: 3.2,
      compatibility: 92,
      isVerified: true,
      tags: ["Loyal", "Active", "Protective"]
    }
  ],
  matches: [
    {
      id: 1,
      petName: "Buddy",
      petPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
      ownerName: "John Doe",
      lastMessage: {
        content: "Hey! Would love to set up a playdate 🐕",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        senderId: "other"
      },
      isOnline: true,
      unreadCount: 2
    }
  ],
  messages: [
    {
      id: 1,
      content: "Hey! Your pet looks absolutely adorable! 😊",
      senderId: "other",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true
    },
    {
      id: 2,
      content: "Thank you! Your furry friend is gorgeous too! 🐾",
      senderId: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true
    }
  ]
};

// Create demo HTML page
const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PawfectMatch Premium - Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .feature-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 20px;
        }
        
        .feature-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .feature-description {
            color: #666;
            line-height: 1.6;
        }
        
        .demo-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .demo-title {
            font-size: 2rem;
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }
        
        .pet-cards {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            padding: 20px 0;
        }
        
        .pet-card {
            min-width: 280px;
            background: #f8f9fa;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .pet-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        .pet-info {
            padding: 20px;
        }
        
        .pet-name {
            font-size: 1.3rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .pet-details {
            color: #666;
            margin-bottom: 10px;
        }
        
        .pet-bio {
            font-size: 0.9rem;
            color: #777;
            line-height: 1.4;
        }
        
        .compatibility {
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            display: inline-block;
            margin-top: 10px;
        }
        
        .status-badge {
            background: linear-gradient(135deg, #FFD700, #FFA000);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            text-align: center;
            margin: 20px 0;
            font-weight: bold;
        }
        
        .tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .tech-item {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐾 PawfectMatch Premium</h1>
            <p>Phase 2 Complete - All Features Implemented!</p>
        </div>
        
        <div class="status-badge">
            ✅ Production Ready - 100% Feature Complete
        </div>
        
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🃏</div>
                <div class="feature-title">Tinder-Style Swipe Cards</div>
                <div class="feature-description">
                    Professional gesture handling with haptic feedback, multi-directional swipes, and smooth animations.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">💬</div>
                <div class="feature-title">Real-Time Chat</div>
                <div class="feature-description">
                    WebSocket-powered messaging with multi-user typing indicators, optimistic UI, and message status tracking.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🤖</div>
                <div class="feature-title">AI Integration</div>
                <div class="feature-description">
                    Bio generation, photo analysis, and compatibility scoring with sentiment analysis and keyword extraction.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">💎</div>
                <div class="feature-title">Premium Features</div>
                <div class="feature-description">
                    Stripe subscription gates, premium feature control, and elegant upgrade flows with multiple tiers.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🔔</div>
                <div class="feature-title">Push Notifications</div>
                <div class="feature-description">
                    Comprehensive notification system with multiple channels, badge management, and notification templates.
                </div>
            </div>
            
            <div class="feature-card">
                <div class="feature-icon">🎨</div>
                <div class="feature-title">Premium UX</div>
                <div class="feature-description">
                    Dark mode support, sophisticated animations, glassmorphic design, and accessibility compliance.
                </div>
            </div>
        </div>
        
        <div class="demo-section">
            <div class="demo-title">Sample Pet Profiles</div>
            <div class="pet-cards" id="petCards">
                <!-- Pet cards will be populated by JavaScript -->
            </div>
        </div>
        
        <div class="demo-section">
            <div class="demo-title">Technology Stack</div>
            <div class="tech-stack">
                <div class="tech-item">React Native + Expo</div>
                <div class="tech-item">Next.js + TypeScript</div>
                <div class="tech-item">Node.js + Socket.io</div>
                <div class="tech-item">Stripe Payments</div>
                <div class="tech-item">Push Notifications</div>
                <div class="tech-item">Premium Animations</div>
                <div class="tech-item">AI Integration</div>
                <div class="tech-item">Real-time Chat</div>
            </div>
        </div>
    </div>
    
    <script>
        // Populate pet cards
        const pets = ${JSON.stringify(demoData.pets)};
        const petCardsContainer = document.getElementById('petCards');
        
        pets.forEach(pet => {
            const card = document.createElement('div');
            card.className = 'pet-card';
            card.innerHTML = \`
                <img src="\${pet.photos[0]}" alt="\${pet.name}" class="pet-image">
                <div class="pet-info">
                    <div class="pet-name">\${pet.name}</div>
                    <div class="pet-details">\${pet.age} years • \${pet.breed}</div>
                    <div class="pet-bio">\${pet.bio}</div>
                    <div class="compatibility">\${pet.compatibility}% Match</div>
                </div>
            \`;
            petCardsContainer.appendChild(card);
        });
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
    res.send(demoHTML);
});

app.get('/api/pets', (req, res) => {
    res.json(demoData.pets);
});

app.get('/api/matches', (req, res) => {
    res.json(demoData.matches);
});

app.get('/api/messages/:matchId', (req, res) => {
    res.json(demoData.messages);
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 PawfectMatch Demo Server Running!

📱 Features Implemented:
✅ Tinder-style swipe cards with gesture handling
✅ Real-time chat with WebSocket integration  
✅ AI bio generation and photo analysis
✅ Premium subscription gates with Stripe
✅ Push notifications with Expo
✅ Premium UX with animations and dark mode

🌐 Open in browser: http://localhost:${PORT}

Phase 2 Complete - Production Ready! 🎉
`);
});

module.exports = app;
