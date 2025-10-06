const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Swagger/OpenAPI Documentation Configuration
 */

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PawfectMatch API',
      version: '1.0.0',
      description: `
# PawfectMatch API Documentation

Welcome to the PawfectMatch API! This comprehensive API powers the world's most advanced pet matching platform.

## Features

- **Pet Matching**: AI-powered pet discovery and compatibility matching
- **Real-time Chat**: WebSocket-based messaging system
- **Premium Features**: Advanced filtering, AI recommendations, video calls
- **User Management**: Complete user profiles and preferences
- **GDPR Compliance**: Data export and deletion endpoints
- **Security**: JWT authentication, rate limiting, input validation

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:
- General endpoints: 100 requests per 15 minutes
- AI endpoints: Variable limits based on subscription tier
- Authentication endpoints: 10 requests per minute

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
\`\`\`

## Support

For API support, please contact: api-support@pawfectmatch.com
      `,
      contact: {
        name: 'PawfectMatch API Support',
        email: 'api-support@pawfectmatch.com',
        url: 'https://pawfectmatch.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.pawfectmatch.com' 
          : 'http://localhost:5001',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'name', 'dateOfBirth'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'User date of birth'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'prefer_not_to_say'],
              description: 'User gender'
            },
            location: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  default: 'Point'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: '[longitude, latitude]'
                },
                city: {
                  type: 'string',
                  description: 'City name'
                },
                state: {
                  type: 'string',
                  description: 'State/Province'
                },
                zipCode: {
                  type: 'string',
                  description: 'ZIP/Postal code'
                }
              }
            },
            bio: {
              type: 'string',
              maxLength: 500,
              description: 'User biography'
            },
            interests: {
              type: 'array',
              items: {
                type: 'string'
              },
              maxItems: 10,
              description: 'User interests'
            },
            preferences: {
              type: 'object',
              properties: {
                ageRange: {
                  type: 'object',
                  properties: {
                    min: {
                      type: 'integer',
                      minimum: 18,
                      maximum: 100
                    },
                    max: {
                      type: 'integer',
                      minimum: 18,
                      maximum: 100
                    }
                  }
                },
                maxDistance: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  description: 'Maximum distance in miles'
                },
                petTypes: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other']
                  }
                }
              }
            },
            subscription: {
              type: 'object',
              properties: {
                plan: {
                  type: 'string',
                  enum: ['basic', 'premium', 'pro'],
                  default: 'basic'
                },
                status: {
                  type: 'string',
                  enum: ['active', 'inactive', 'cancelled', 'past_due']
                },
                stripeCustomerId: {
                  type: 'string'
                },
                stripeSubscriptionId: {
                  type: 'string'
                },
                currentPeriodStart: {
                  type: 'string',
                  format: 'date-time'
                },
                currentPeriodEnd: {
                  type: 'string',
                  format: 'date-time'
                }
              }
            },
            isPremium: {
              type: 'boolean',
              default: false
            },
            isActive: {
              type: 'boolean',
              default: true
            },
            lastActive: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Pet: {
          type: 'object',
          required: ['name', 'species', 'breed', 'age', 'gender', 'size'],
          properties: {
            _id: {
              type: 'string',
              description: 'Pet ID'
            },
            name: {
              type: 'string',
              maxLength: 50,
              description: 'Pet name'
            },
            species: {
              type: 'string',
              enum: ['dog', 'cat', 'rabbit', 'bird', 'fish', 'reptile', 'other'],
              description: 'Pet species'
            },
            breed: {
              type: 'string',
              maxLength: 100,
              description: 'Pet breed'
            },
            age: {
              type: 'integer',
              minimum: 0,
              maximum: 30,
              description: 'Pet age in years'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'unknown'],
              description: 'Pet gender'
            },
            size: {
              type: 'string',
              enum: ['small', 'medium', 'large', 'extra_large'],
              description: 'Pet size'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Pet description'
            },
            photos: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                  publicId: {
                    type: 'string'
                  },
                  isPrimary: {
                    type: 'boolean',
                    default: false
                  }
                }
              },
              maxItems: 10
            },
            location: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  default: 'Point'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2
                }
              }
            },
            personality: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'friendly', 'shy', 'energetic', 'calm', 'playful', 'independent',
                  'loyal', 'protective', 'social', 'curious', 'gentle', 'active',
                  'quiet', 'vocal', 'affectionate', 'reserved'
                ]
              },
              maxItems: 10
            },
            intent: {
              type: 'string',
              enum: ['adoption', 'mating', 'playdate', 'all'],
              description: 'Pet owner intent'
            },
            isVaccinated: {
              type: 'boolean',
              description: 'Vaccination status'
            },
            isSpayedNeutered: {
              type: 'boolean',
              description: 'Spay/neuter status'
            },
            medicalHistory: {
              type: 'string',
              maxLength: 2000,
              description: 'Medical history'
            },
            careInstructions: {
              type: 'string',
              maxLength: 1000,
              description: 'Care instructions'
            },
            owner: {
              type: 'string',
              description: 'Owner user ID'
            },
            isActive: {
              type: 'boolean',
              default: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Match: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Match ID'
            },
            users: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              maxItems: 2,
              description: 'Array of user IDs'
            },
            pets: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              maxItems: 2,
              description: 'Array of pet IDs'
            },
            status: {
              type: 'string',
              enum: ['pending', 'matched', 'archived', 'blocked'],
              default: 'pending'
            },
            compatibilityScore: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'AI-calculated compatibility score'
            },
            lastMessageAt: {
              type: 'string',
              format: 'date-time'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Message: {
          type: 'object',
          required: ['matchId', 'senderId', 'content'],
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID'
            },
            matchId: {
              type: 'string',
              description: 'Match ID'
            },
            senderId: {
              type: 'string',
              description: 'Sender user ID'
            },
            recipientId: {
              type: 'string',
              description: 'Recipient user ID'
            },
            content: {
              type: 'string',
              maxLength: 1000,
              description: 'Message content'
            },
            type: {
              type: 'string',
              enum: ['text', 'image', 'emoji', 'gift'],
              default: 'text'
            },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri'
                  },
                  type: {
                    type: 'string'
                  },
                  size: {
                    type: 'integer'
                  }
                }
              }
            },
            read: {
              type: 'boolean',
              default: false
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Detailed error information'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  },
                  value: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              default: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
};

// Generate Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { color: #6366f1; }
    .swagger-ui .scheme-container { background: #f8fafc; }
  `,
  customSiteTitle: 'PawfectMatch API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Serve raw OpenAPI spec
router.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API documentation info endpoint
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      title: 'PawfectMatch API',
      version: '1.0.0',
      description: 'Comprehensive API for pet matching platform',
      documentation: {
        swagger: '/api/docs',
        openapi: '/api/docs/openapi.json',
        postman: '/api/docs/postman.json'
      },
      endpoints: {
        total: Object.keys(swaggerSpec.paths || {}).length,
        authenticated: Object.values(swaggerSpec.paths || {}).filter(path => 
          Object.values(path).some(method => method.security)
        ).length
      },
      features: [
        'Pet matching and discovery',
        'Real-time messaging',
        'Premium features',
        'AI recommendations',
        'GDPR compliance',
        'Rate limiting',
        'Input validation'
      ]
    }
  });
});

// Generate Postman collection
router.get('/postman.json', (req, res) => {
  try {
    const postmanCollection = {
      info: {
        name: 'PawfectMatch API',
        description: 'Complete API collection for PawfectMatch',
        version: '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{jwt_token}}',
            type: 'string'
          }
        ]
      },
      variable: [
        {
          key: 'base_url',
          value: process.env.NODE_ENV === 'production' 
            ? 'https://api.pawfectmatch.com' 
            : 'http://localhost:5001',
          type: 'string'
        },
        {
          key: 'jwt_token',
          value: '',
          type: 'string'
        }
      ],
      item: []
    };

    // Convert Swagger paths to Postman requests
    Object.entries(swaggerSpec.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        if (method === 'parameters') return;

        const request = {
          name: details.summary || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [
              {
                key: 'Content-Type',
                value: 'application/json'
              }
            ],
            url: {
              raw: '{{base_url}}' + path,
              host: ['{{base_url}}'],
              path: path.split('/').filter(p => p)
            }
          },
          response: []
        };

        // Add authentication if required
        if (details.security) {
          request.request.auth = {
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: '{{jwt_token}}',
                type: 'string'
              }
            ]
          };
        }

        // Add request body if present
        if (details.requestBody) {
          request.request.body = {
            mode: 'raw',
            raw: JSON.stringify(details.requestBody.content['application/json'].example || {}, null, 2)
          };
        }

        postmanCollection.item.push(request);
      });
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(postmanCollection);

  } catch (error) {
    logger.error('Failed to generate Postman collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate Postman collection'
    });
  }
});

module.exports = router;
