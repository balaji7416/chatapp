# API Endpoints

> **NOTE**: All response data is wrapped in a `data` field.
> Example: `res.data.user` or `res.data.refresh_token`

## Authentication

- **POST /api/auth/register**
  - Register user
  - Body: `{username: "string", password:"string", email: "string"}`
  - Sets cookies (access token + refresh token)
  - Returns: `{user, access_token,refresh_token}`

- **POST /api/auth/login**
  - Login user
  - Body: `{email: "string", password: "string"}`
  - Set cookies (access token +refresh token)
  - Returns: `{user, access_token,refresh_token}`

- **POST /api/auth/refresh**
  - Refresh access token
  - Set cookies (new access token + new refresh token)
  - Returns: `{access_token, refresh_token}`

- **POST /api/auth/logout**
  - Logout user
  - **Auth**: required
  - Remove cookies
  - Returns: success message

## Conversations

- **POST /api/conversations**
  - Create new conversation
  - Body: `{name: "string", isGroup: boolean, "members":["uuid"]}`
  - **Auth**: required
  - Returns: conversation object

- **POST /api/conversations/:conversationId/members/:userIdToAdd**
  - Add member to conversation
  - URL params: conversationId, userIdToAdd
  - **Auth**: required + must be member
  - Returns: `{conversationId, userId}`

- **GET /api/conversations**
  - Get user conversations
  - **Auth**: required
  - Returns: array of conversations

- **GET /api/conversations/:id/members**
  - Get users belonging to conversation
  - URL params: conversationId
  - **Auth**: required + must be member
  - Returns: array of users

- **GET /api/conversations/:id**
  - Get conversation by id
  - URL params: conversationId
  - **Auth**: required + must be member
  - Returns: conversation object

- **DELETE /api/conversations/:conversationId/members/:userIdToRemove**
  - Remove user from conversation
  - URL params: conversationId, userId to remove
  - **Auth**: required + must be admin
  - Returns: `{conversationId, userId}`
