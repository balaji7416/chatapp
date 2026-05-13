# Chat App

A full stack real time chat application, built with React, Express, Postgres, and Socket.IO

## Tech Stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- Socket.IO
- Neon (PostgresSQL hosting)

### Frontend

- React
- Tailwind
- DaisyUI

## Features

### Authentication

- User registration
- Login & logout
- JWT token authentication
- Access token - short lived
- Refresh token - long lived, used to generate new access token
- Cookies + local storage token support
- Protected routes

### Real-Time Messaging

- Instant messaging with Socket.IO
- Real time event handling
- Persistent chat storage with PostgreSQL

### Conversations/Chats

- One-to-One conversations
- Group conversations
- Add / Remove conversation members
- Delete conversations
- Exit conversations

### Additional

- Typing indicators
- unread message badges

## Project Structure

### Backend

```bash
backend
├── config/         # DB & app configuration
├── controllers/    # Route controllers
├── database/       # Database setup
├── middleware/     # Express middlewares
├── repositories/   # DB queries / data layer
├── routes/         # API routes
├── services/       # Business logic
├── socket/         # Socket.IO setup & handlers
├── utils/          # Helper functions
├── package.json
└── server.js
```

### Frontend

```bash
frontend
├── public/
├── src/
│   ├── components/
│   │   └── sidebar/
│   ├── lib/
│   ├── pages/
│   │   ├── auth/
│   │   └── main/
│   │       ├── chatarea/
│   │       └── sidebar/
│   ├── store/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Environmental Variables

run this in `backend/` directory

```bash
cp .env.example .env
```

or
create a .env file inside `backend/` directory

```bash
PORT=5000

DATABASE_URL=

JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=

NODE_ENV=development
```

fill the required fields with your credentials

## Local Setup

### Run these commands in order

```bash
git clone https://github.com/balaji7416/chatapp

cd chatapp/backend
npm install

cd ../frontend
npm install
```

### Database Setup

This project uses PostgreSQL
You can either:

- run PostgreSQL locally
- use a cloud PostgreSQL provider like Neon

#### Local PostgreSQL

Example connection string

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/chatapp
```

Create database

```bash
psql -U postgres -c "CREATE DATABASE chatapp;"
```

Import schema

```bash
psql -U postgres -d chatapp -f database/schema.sql
```

#### Cloud provider - Neon

create a PostgreSQL database using Neon and add the provided connection string to

```bash
DATABASE_URL=
```

Import Schema - run from chatapp/backend

```bash
psql "YOUR_DATABASE_URL" -f database/schema.sql
```

#### Start the development server

Backend

```bash
cd backend
npm run dev
```

Frontend

```bash
cd frontend
npm run dev
```

server runs at

```bash
http://localhost:5000
```

## API Documentation

Detailed API documentation is available in [`backend/API.md`](backend/API.md).

## Live Demo

- Frontend: [Live App](https://chatapp-sigma-murex.vercel.app/)
- Backend: [API Server](https://chatapp-backend-8ppk.onrender.com)

## Author

Ramala Karthik
