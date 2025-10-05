# PawfectMatch API Contract

**Version:** 1.0.0  
**Last Updated:** October 2, 2025  
**Purpose:** Definitive API contract for full-stack integration testing

This document defines every API endpoint in the PawfectMatch application, including request/response structures and error scenarios. This serves as the source of truth for automated testing.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Management Endpoints](#user-management-endpoints)
3. [Pet Management Endpoints](#pet-management-endpoints)
4. [Matching & Swiping Endpoints](#matching--swiping-endpoints)
5. [Chat & Messaging Endpoints](#chat--messaging-endpoints)
6. [Premium & Subscription Endpoints](#premium--subscription-endpoints)
7. [AI & Enhancement Endpoints](#ai--enhancement-endpoints)
8. [Health & Monitoring Endpoints](#health--monitoring-endpoints)

---

## Authentication Endpoints

### POST /api/auth/register

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (required, min 1 char)",
  "lastName": "string (required, min 1 char)",
  "dateOfBirth": "string (required, ISO8601 date, must be 18+)",
  "phone": "string (optional, valid mobile phone)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "dateOfBirth": "string",
      "age": "number",
      "avatar": "string|null",
      "bio": "string|null",
      "location": {
        "type": "Point",
        "coordinates": "[number, number]",
        "address": {}
      },
      "preferences": {},
      "premium": {
        "isActive": false,
        "plan": "basic"
      },
      "analytics": {},
      "createdAt": "string",
      "updatedAt": "string"
    },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "User already exists with this email" | "Validation failed" | "You must be at least 18 years old to register",
    "errors": "[array of validation errors, if applicable]"
  }
  ```
- **429 Too Many Requests:**
  ```json
  {
    "success": false,
    "message": "Too many authentication attempts, please try again later"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Registration failed",
    "error": "string"
  }
  ```

---

### POST /api/auth/login

**Description:** Authenticate user and obtain access tokens

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "avatar": "string|null",
      "premium": {
        "isActive": "boolean",
        "plan": "string"
      }
    },
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Please provide email and password" | "Validation failed"
  }
  ```
- **401 Unauthorized:**
  ```json
  {
    "success": false,
    "message": "Invalid credentials" | "Account is inactive. Please contact support." | "Account is blocked. Please contact support."
  }
  ```
- **429 Too Many Requests:** (same as register)
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Login failed",
    "error": "string"
  }
  ```

---

### POST /api/auth/logout

**Description:** Logout user and invalidate refresh token

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "refreshToken": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- **401 Unauthorized:** (if token invalid/missing)
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Logout failed"
  }
  ```

---

### GET /api/auth/me

**Description:** Get current authenticated user profile

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "dateOfBirth": "string",
      "age": "number",
      "avatar": "string|null",
      "bio": "string|null",
      "phone": "string|null",
      "location": {},
      "preferences": {},
      "premium": {},
      "analytics": {},
      "pets": "[array of pet objects]",
      "matches": "[array of match IDs]",
      "isActive": "boolean",
      "isEmailVerified": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized:** (if token invalid/missing/expired)
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to get user data"
  }
  ```

---

### POST /api/auth/refresh-token

**Description:** Refresh access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string (JWT)",
    "refreshToken": "string (JWT)",
    "user": {}
  }
}
```

**Error Responses:**
- **401 Unauthorized:**
  ```json
  {
    "success": false,
    "message": "Refresh token required" | "Invalid refresh token"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Token refresh failed"
  }
  ```

---

### POST /api/auth/verify-email

**Description:** Verify user email address with token

**Request Body:**
```json
{
  "token": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Invalid or expired verification token"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Email verification failed"
  }
  ```

---

### POST /api/auth/forgot-password

**Description:** Request password reset email

**Request Body:**
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "User not found with this email"
  }
  ```
- **429 Too Many Requests:**
  ```json
  {
    "success": false,
    "message": "Too many password reset attempts, please try again later"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to send password reset email"
  }
  ```

---

### POST /api/auth/reset-password

**Description:** Reset password with reset token

**Request Body:**
```json
{
  "token": "string (required)",
  "password": "string (required, min 6 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Invalid or expired reset token" | "Validation failed"
  }
  ```
- **429 Too Many Requests:** (same as forgot-password)
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Password reset failed"
  }
  ```

---

## User Management Endpoints

### GET /api/users/profile

**Description:** Get authenticated user's profile

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "bio": "string|null",
      "avatar": "string|null",
      "phone": "string|null",
      "dateOfBirth": "string",
      "age": "number",
      "location": {},
      "preferences": {},
      "premium": {},
      "analytics": {},
      "pets": "[]",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **500 Internal Server Error**

---

### PUT /api/users/profile

**Description:** Update user profile information

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "firstName": "string (optional, 1-50 chars)",
  "lastName": "string (optional, 1-50 chars)",
  "bio": "string (optional, max 500 chars)",
  "phone": "string (optional, valid mobile phone)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {}
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- **500 Internal Server Error**

---

### PUT /api/users/preferences

**Description:** Update user matching preferences

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "species": "[array of strings] (optional)",
  "intents": "[array of strings] (optional)",
  "ageRange": {
    "min": "number (optional)",
    "max": "number (optional)"
  },
  "maxDistance": "number (optional)",
  "notifications": {
    "email": "boolean (optional)",
    "push": "boolean (optional)",
    "matches": "boolean (optional)",
    "messages": "boolean (optional)"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {}
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### PUT /api/users/location

**Description:** Update user location

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "coordinates": "[number, number] (required, [longitude, latitude])",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zipCode": "string (optional)",
    "country": "string (optional)"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "location": {}
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### GET /api/users/stats

**Description:** Get user statistics

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPets": "number",
      "totalMatches": "number",
      "totalSwipes": "number",
      "totalLikes": "number",
      "profileViews": "number",
      "lastActive": "string"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/users/avatar

**Description:** Upload user avatar image

**Authentication:** Required (Bearer token)

**Request:** multipart/form-data with `avatar` file field (max 2MB, images only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": "string (URL)"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Only image files are allowed" | "File too large"
  }
  ```
- **401 Unauthorized**
- **500 Internal Server Error**

---

### DELETE /api/users/account

**Description:** Delete user account permanently

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

## Pet Management Endpoints

### POST /api/pets

**Description:** Create a new pet profile

**Authentication:** Required (Bearer token)

**Request:** multipart/form-data with optional `photos` files (max 10 files, 5MB each)

**Form Fields:**
```json
{
  "name": "string (required, 1-50 chars)",
  "species": "string (required, enum: dog|cat|bird|rabbit|other)",
  "breed": "string (required, 1-100 chars)",
  "age": "number (required, 0-30)",
  "gender": "string (required, enum: male|female)",
  "size": "string (required, enum: tiny|small|medium|large|extra-large)",
  "intent": "string (required, enum: adoption|mating|playdate|all)",
  "weight": "number (optional, 0-200)",
  "description": "string (optional, max 1000 chars)",
  "personalityTags": "[array] (optional)",
  "healthInfo": "object (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Pet created successfully",
  "data": {
    "pet": {
      "_id": "string",
      "owner": "string",
      "name": "string",
      "species": "string",
      "breed": "string",
      "age": "number",
      "gender": "string",
      "size": "string",
      "intent": "string",
      "photos": "[array]",
      "location": {},
      "analytics": {},
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to create pet",
    "error": "string"
  }
  ```

---

### GET /api/pets/discover

**Description:** Discover swipeable pets with filters

**Authentication:** Required (Bearer token)

**Query Parameters:**
```
species: string (optional)
intent: string (optional)
maxDistance: number (optional, default 50)
minAge: number (optional)
maxAge: number (optional)
size: string (optional)
gender: string (optional)
breed: string (optional)
page: number (optional, default 1)
limit: number (optional, default 10)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pets": "[array of pet objects]",
    "aiRecommendations": "[array] (if premium user)",
    "pagination": {
      "page": "number",
      "limit": "number",
      "hasMore": "boolean"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to discover pets",
    "error": "string"
  }
  ```

---

### GET /api/pets/my-pets

**Description:** Get all pets owned by authenticated user

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pets": "[array of pet objects]"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### GET /api/pets/:id

**Description:** Get single pet by ID

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `id`: Pet ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "pet": {
      "_id": "string",
      "owner": {},
      "name": "string",
      "species": "string",
      "breed": "string",
      "age": "number",
      "gender": "string",
      "size": "string",
      "intent": "string",
      "photos": "[]",
      "description": "string",
      "location": {},
      "analytics": {},
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Pet not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to get pet",
    "error": "string"
  }
  ```

---

### PUT /api/pets/:id

**Description:** Update pet profile

**Authentication:** Required (Bearer token, must be owner)

**URL Parameters:**
- `id`: Pet ID (string, required)

**Request:** multipart/form-data with optional `photos` files

**Form Fields:** (all optional)
```json
{
  "name": "string",
  "description": "string",
  "personalityTags": "[array]",
  "intent": "string",
  "availability": "object",
  "healthInfo": "object",
  "status": "string",
  "isActive": "boolean"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pet updated successfully",
  "data": {
    "pet": {}
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Pet not found or you are not the owner"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to update pet",
    "error": "string"
  }
  ```

---

### DELETE /api/pets/:id

**Description:** Delete pet profile

**Authentication:** Required (Bearer token, must be owner)

**URL Parameters:**
- `id`: Pet ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pet deleted successfully"
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Pet not found or you are not the owner"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to delete pet",
    "error": "string"
  }
  ```

---

### POST /api/pets/:petId/swipe

**Description:** Swipe on a pet (like, pass, or superlike)

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `petId`: Pet ID to swipe on (string, required)

**Request Body:**
```json
{
  "action": "string (required, enum: like|pass|superlike)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Swipe recorded successfully",
  "data": {
    "isMatch": "boolean",
    "matchId": "string|null",
    "action": "string",
    "match": "object|null (if isMatch is true)"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Invalid swipe action" | "Already swiped on this pet" | "Validation failed"
  }
  ```
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Pet not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to record swipe",
    "error": "string"
  }
  ```

---

## Matching & Swiping Endpoints

### GET /api/matches

**Description:** Get all matches for authenticated user

**Authentication:** Required (Bearer token)

**Query Parameters:**
```
status: string (optional, default: active)
page: number (optional, default: 1)
limit: number (optional, default: 20)
sortBy: string (optional, default: lastActivity)
order: string (optional, default: desc)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "matches": "[array of match objects with populated pets and users]",
    "pagination": {
      "page": "number",
      "limit": "number",
      "hasMore": "boolean"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to get matches",
    "error": "string"
  }
  ```

---

### GET /api/matches/stats

**Description:** Get match statistics for authenticated user

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMatches": "number",
      "activeMatches": "number",
      "totalMessages": "number",
      "avgMessagesPerMatch": "number"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### GET /api/matches/:matchId

**Description:** Get single match with messages

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "match": {
      "_id": "string",
      "pet1": "object (populated)",
      "pet2": "object (populated)",
      "user1": "object (populated)",
      "user2": "object (populated)",
      "status": "string",
      "matchType": "string",
      "compatibilityScore": "number",
      "messages": "[array]",
      "createdAt": "string",
      "lastActivity": "string"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **403 Forbidden:**
  ```json
  {
    "success": false,
    "message": "Match is blocked"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Match not found"
  }
  ```
- **500 Internal Server Error**

---

### GET /api/matches/:matchId/messages

**Description:** Get messages for a match (paginated)

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Query Parameters:**
```
page: number (optional, default: 1)
limit: number (optional, default: 50)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": "[array of message objects]",
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "hasMore": "boolean"
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Match not found"
  }
  ```
- **500 Internal Server Error**

---

### POST /api/matches/:matchId/messages

**Description:** Send a message in a match

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Request Body:**
```json
{
  "content": "string (required, 1-1000 chars)",
  "messageType": "string (optional, enum: text|image|location, default: text)",
  "attachments": "[array] (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "sender": "object (populated)",
      "content": "string",
      "messageType": "string",
      "sentAt": "string",
      "readBy": "[]"
    }
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Validation failed" | "Cannot send message to inactive match"
  }
  ```
- **401 Unauthorized**
- **403 Forbidden:**
  ```json
  {
    "success": false,
    "message": "Cannot send message to blocked match"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Match not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to send message",
    "error": "string"
  }
  ```

---

### PATCH /api/matches/:matchId/archive

**Description:** Archive or unarchive a match

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Match archived successfully" | "Match unarchived successfully",
  "data": {
    "isArchived": "boolean"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Match not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Failed to archive match",
    "error": "string"
  }
  ```

---

### PATCH /api/matches/:matchId/block

**Description:** Block a match

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Match blocked successfully"
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**

---

### PATCH /api/matches/:matchId/favorite

**Description:** Toggle favorite status for a match

**Authentication:** Required (Bearer token, must be participant)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Match added to favorites" | "Match removed from favorites",
  "data": {
    "isFavorite": "boolean"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**

---

## Chat & Messaging Endpoints

### GET /api/chat/history/:matchId

**Description:** Get chat history for a match

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": "[array of message objects]"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**

---

### POST /api/chat/read/:matchId

**Description:** Mark messages as read in a chat

**Authentication:** Required (Bearer token)

**URL Parameters:**
- `matchId`: Match ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

**Error Responses:**
- **401 Unauthorized**
- **404 Not Found**
- **500 Internal Server Error**

---

### GET /api/chat/online

**Description:** Get list of online users

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "onlineUsers": "[array of user IDs]"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

## Premium & Subscription Endpoints

### POST /api/premium/subscribe

**Description:** Create Stripe checkout session for premium subscription

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "plan": "string (required, e.g., premium)",
  "interval": "string (required, enum: month|year)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "string (Stripe session ID)",
    "url": "string (Stripe checkout URL)"
  }
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "Invalid plan or interval"
  }
  ```
- **401 Unauthorized**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Server Error"
  }
  ```

---

### POST /api/premium/cancel

**Description:** Cancel active premium subscription

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

**Error Responses:**
- **400 Bad Request:**
  ```json
  {
    "success": false,
    "message": "No active subscription found"
  }
  ```
- **401 Unauthorized**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Server Error"
  }
  ```

---

### GET /api/premium/features

**Description:** Get available premium features

**Authentication:** None required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "features": {
      "premium": "[array of feature strings]",
      "gold": "[array of feature strings]"
    }
  }
}
```

**Error Responses:**
- **500 Internal Server Error**

---

### POST /api/premium/boost/:petId

**Description:** Boost a pet's profile (premium feature)

**Authentication:** Required (Bearer token, premium user only)

**URL Parameters:**
- `petId`: Pet ID (string, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile boosted successfully"
}
```

**Error Responses:**
- **401 Unauthorized**
- **403 Forbidden:**
  ```json
  {
    "success": false,
    "message": "This feature is for premium users only"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "success": false,
    "message": "Pet not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Server Error"
  }
  ```

---

### GET /api/premium/super-likes

**Description:** Get super like balance (premium feature)

**Authentication:** Required (Bearer token, premium user only)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "superLikes": "number"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **403 Forbidden**
- **500 Internal Server Error**

---

## AI & Enhancement Endpoints

### POST /api/ai/generate-bio

**Description:** Generate AI-powered bio text

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "keywords": "[array of strings] (required)",
  "petName": "string (optional)",
  "tone": "string (optional)",
  "length": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bio": "string",
    "cached": "boolean"
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/ai/analyze-photos

**Description:** Analyze pet photos with AI

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "photoUrls": "[array of strings] (required, valid URLs)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "analysis": "object",
    "insights": "[array]",
    "cached": "boolean"
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/ai/enhanced-compatibility

**Description:** Advanced AI compatibility analysis between two pets

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "pet1": "object (required)",
  "pet2": "object (required)",
  "options": "object (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "compatibility_score": "number",
    "breakdown": "object",
    "recommendation": "string",
    "cached": "boolean"
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/ai/compatibility

**Description:** Legacy compatibility analysis (enhanced backend)

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "pet1": "object (required)",
  "pet2": "object (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "compatibility_score": "number",
    "recommendation": "string"
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/ai/assist-application

**Description:** AI-powered adoption application assistance

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userProfile": "object (required)",
  "petProfile": "object (required)",
  "questionType": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": "[array]",
    "guidance": "string"
  }
}
```

**Error Responses:**
- **400 Bad Request:** (validation errors)
- **401 Unauthorized**
- **500 Internal Server Error**

---

### GET /api/ai/cache/stats

**Description:** Get AI cache statistics

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cacheSize": "number",
    "hitRate": "number",
    "ttl": "number"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### POST /api/ai/cache/clear

**Description:** Clear AI response cache

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "entriesCleared": "number"
  }
}
```

**Error Responses:**
- **401 Unauthorized**
- **500 Internal Server Error**

---

### GET /api/ai/health

**Description:** AI service health check

**Authentication:** None required

**Success Response (200):**
```json
{
  "success": true,
  "status": "healthy",
  "service": "string",
  "timestamp": "string",
  "cache": {},
  "endpoints": {},
  "ai_service": "string"
}
```

**Error Responses:**
- **500 Internal Server Error:**
  ```json
  {
    "success": false,
    "message": "Health check failed",
    "error": "string"
  }
  ```

---

## Health & Monitoring Endpoints

### GET /health

**Description:** Comprehensive system health check

**Authentication:** None required

**Success Response (200):**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "string",
  "uptime": "number",
  "environment": "string",
  "responseTime": "string",
  "checks": {
    "mongodb": {
      "status": "up" | "down",
      "state": "string",
      "responseTime": "string",
      "ping": "string"
    },
    "memory": {
      "status": "healthy" | "warning",
      "heapUsed": "string",
      "heapTotal": "string",
      "rss": "string",
      "external": "string"
    },
    "cpu": {
      "user": "string",
      "system": "string"
    }
  }
}
```

**Error Responses:**
- **503 Service Unavailable:** (if unhealthy/degraded)
- **500 Internal Server Error:**
  ```json
  {
    "status": "error",
    "error": "string",
    "timestamp": "string"
  }
  ```

---

### GET /health/ready

**Description:** Kubernetes readiness probe

**Authentication:** None required

**Success Response (200):**
```
OK
```

**Error Responses:**
- **503 Service Unavailable:**
  ```
  Not Ready
  ```

---

### GET /health/live

**Description:** Kubernetes liveness probe

**Authentication:** None required

**Success Response (200):**
```
OK
```

---

## Common Error Response Structure

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "string (human-readable error message)",
  "error": "string (optional, technical error details)",
  "errors": "[array] (optional, validation error details)",
  "code": "string (optional, error code for client handling)"
}
```

## Common HTTP Status Codes

- **200 OK:** Request succeeded
- **201 Created:** Resource created successfully
- **400 Bad Request:** Invalid request data/validation failed
- **401 Unauthorized:** Authentication required or invalid
- **403 Forbidden:** Authenticated but not authorized for this resource
- **404 Not Found:** Resource not found
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error occurred
- **503 Service Unavailable:** Service temporarily unavailable

---

## Authentication

Most endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes (configurable). Use the `/api/auth/refresh-token` endpoint to obtain a new access token using the refresh token.

---

## Rate Limiting

- **Auth endpoints:** 5 requests per 15 minutes per IP
- **Password reset:** 3 requests per hour per IP
- **General API:** 100 requests per 15 minutes per IP (production only)
- Rate limits are skipped in test environment

---

**End of API Contract**

