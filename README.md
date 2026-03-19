# Auth App — MERN Stack

A full-stack authentication system built with MongoDB, Express, React, and Node.js.

## Features

- Sign up & Login with email/password
- Password strength meter with real-time hints
- Email verification via OTP
- Forgot password / reset via OTP
- Continue with Google (OAuth 2.0)
- JWT authentication with HTTP-only cookies
- Protected routes (login required for dashboard)
- Fully responsive dark UI with glassmorphism design

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router v7, Axios, React Toastify, @react-oauth/google

**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer, Brevo SMTP

## Project Structure

```
login-signup-mern/
├── client/          # React + Vite frontend
└── server/          # Express + MongoDB backend
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Brevo account (for email)
- Google OAuth 2.0 Client ID

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/login-signup-mern.git
cd login-signup-mern
```

### 2. Setup the server

```bash
cd server
npm install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
MONGODB_URL=your_mongodb_connection_string
TOKEN_SECRET=your_strong_random_secret
SENDER_EMAIL=your_email@example.com
SENDER_NAME=Your App Name
SMTP_USER=your_brevo_smtp_user
SMTP_PASS=your_brevo_smtp_password
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Start the server:

```bash
npm start
```

Server runs on `http://localhost:4000`

### 3. Setup the client

```bash
cd client
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the client:

```bash
npm run dev
```

Client runs on `http://localhost:5173`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create an OAuth 2.0 Client ID
3. Add `http://localhost:5173` to **Authorized JavaScript origins**
4. Add `http://localhost:5173` to **Authorized redirect URIs**
5. Copy the Client ID to both `.env` files

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | No |
| POST | `/api/auth/google-login` | Google OAuth login | No |
| POST | `/api/auth/send-verify-otp` | Send email verification OTP | Yes |
| POST | `/api/auth/verify-account` | Verify email with OTP | Yes |
| POST | `/api/auth/send-reset-otp` | Send password reset OTP | No |
| POST | `/api/auth/verify-reset-otp` | Verify reset OTP | No |
| POST | `/api/auth/new-password` | Set new password | No |
| GET | `/api/user/data` | Get logged-in user data | Yes |
