# Chat App

## Current Status

**Backend: Complete** - All Core features are working
**Frontend:** In progress (building with React + Tailwind)

## Backend

### Tech

    - Server: Express, NodeJs
    - Database: Postgres
    - Auth: JWT

### Features:

#### Authentication

- Register
- Login
- Logout
- Token refresh

> access token - short lived (15 min)
> refresh token - long lived (7d), used for refreshing access token when expired

#### Conversations

- create conversation
- delete conversation
- join conversation
- add members to conversation
- group and one-one conversations

#### Real-time (Socket.IO)

    - Instant messaging

> **NOTE**: for detailed API documentation, see [backend/API.md](backend/API.md)

---

## SET UP

### Prerequisites

    - Node.js
    - PostgresSQL

### Installation

```bash

# Clone repository
git clone https://github.com/balaji7416/chatapp
cd chatapp
cd backend

# Install dependencies
npm install

# Set up environment variables
# Create .env file in backend/ directory with:

PORT=5000
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=chatapp
DB_HOST=localhost
DB_PORT=5432

JWT_ACCESS_TOKEN_SECRET=your_secret_key
JWT_REFRESH_TOKEN_SECRET=your_secret_key

NODE_ENV=development

## Database setup
#run these commands
#(replace postgres with your postgres username if different)
psql -U postgres -c "CREATE DATABASE chatapp;"
psql -U postgres -d chatapp -f database/schema.sql

#if asked for password, enter your postgreSQL password

#Start development server
npm run dev
```

## API BASE URL: [http://localhost:5000/api](http://localhost:5000/api)

## Made by:

**Ramala Karthik**
