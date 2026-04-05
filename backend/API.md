# API Endpoints

# REST

> **NOTE**: All response data is wrapped in a `data` field.
> Example: `res.data.user` or `res.data.refresh_token`
> response object - `{status,message,data: {}}`
> use res.data.data if using axios to get the required response data

## Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request (invalid input)
- `401` - Unathorized (missing/invalid token)
- `403` - Forbidden (no permission)
- `404` - Resource not found

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

- **POST /api/conversations/:conversationId/join**
  - Join a conversation
  - URL params: conversationId
  - **AUTH**: required
  - returns {conversation obj in data field of res}

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

- **DELETE /api/conversations/:id/members/me**
  - Leave conversation (remove yourself)
  - URL params: `id` - conversation ID
  - **AUTH**: required + must be member
  - Returns: `{conversationId, leftUserId, conversationName, leftUsername}`

- **DELETE /api/conversations/:id**
  - Delete conversation
  - URL params: `id` - conversation ID
  - **Auth**: required + must be admin
  - returns: `{message, data: {id,name}}`

## Messages

- **POST /api/messages/:conversationId**
  - Sends a message to conversation
  - URL params: `conversationId`
  - Body: `{messageContent: "string", replyToId: "uuid" (optional)}`
  - **Auth**: required + must be conversation member
  - Returns: message object

- **GET /api/messages/:conversationId**
  - Get messages of conversation
  - URL paramas: `conversationId`
  - **Auth**: required + must be conversation member
  - Returns: array of messages

- **GET /api/messages/:messageId/read-receipts/?conversationId="conversation_id"**
  - Get message read receipts
  - URL params: messageId
  - Query params: conversationId
  - **Auth**: required
  - Returns: conversation members (who read the message)

- **DELETE /api/messages/:messageId**
  - Delete message
  - URL params: `messageId`
  - **Auth**: required + must be owner of message or admin of conversation
  - Returns: {id, content}

- **POST /api/messages/:conversationId/read**
  - marks messages of conversation as read, updates the last_read_message of user for that conversation
  - URL params: `conversationId`
  - **Auth**: required + must be a member
  - Returns : conversation member obj

---

# SOCKET

> **NOTE**:
> **Error Format**
> {

    success: false,
    event: string,      // Which event caused error
    code: string,       // e.g., "UNAUTHORIZED"
    statusCode: number, // 401, 400, 500
    message: string,
    timestamp: string

}

> **Response Format**
> {

    success: true,
    event: string,
    message: string,
    data: any,
    timestamp: string

}

## AUTH

- **Server emitting events**
  - `server:session_expired` - when access token expires
  - `connect_error` - on auth failure (invalid/missing token)

- **Client connection**

```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "JWT_ACCESS_TOKEN" },
});
```
