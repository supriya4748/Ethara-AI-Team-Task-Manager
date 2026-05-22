# Ethara AI Team Task Manager

Ethara AI Team Task Manager is a full-stack team collaboration and task management platform designed for modern teams to organize projects, assign tasks, track progress, and manage workflows efficiently.

The application provides secure authentication, role-based access control, project management, task assignment, progress tracking, overdue monitoring, and a premium responsive user interface.

---

## Live Demo

**Frontend URL:**
`ethara-ai-team-task-manager-production-e5ab.up.railway.app`

**Backend API URL:**
`ethara-ai-task-manager-production-2159.up.railway.app`

---

# Features

## Authentication & Security

* User Signup & Login
* JWT-based Authentication
* Password Hashing using bcrypt
* Protected Routes
* Session Persistence
* Automatic Unauthorized Session Handling

---

## Role-Based Access Control (RBAC)

### Admin

* Create Projects
* Update Projects
* Delete Projects
* Create Tasks
* Assign Tasks to Members
* Manage Team Workflow

### Member

* View Assigned Projects
* Update Task Status
* Track Work Progress

---

## Project Management

* Create and Manage Projects
* Project Description Support
* Project Ownership Tracking
* Responsive Project Dashboard

---

## Task Management

* Create Tasks
* Assign Tasks to Team Members
* Task Priorities

  * Low
  * Medium
  * High
* Task Status Workflow

  * Todo
  * In Progress
  * Review
  * Done
* Due Date Management
* Overdue Task Detection

---

## Dashboard & Analytics

* Task Statistics
* Overdue Task Indicators
* Real-Time Status Updates
* Workspace Overview

---

## UI & User Experience

* Modern Dark-Themed Interface
* Responsive Design
* Toast Notifications
* Keyboard Accessibility
* Modal Close Handling
* Loading States
* Smooth User Experience

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Context API

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL

## Database

* Neon PostgreSQL

## Deployment

* Railway

---

# Folder Structure

```bash
Ethara-AI-Team-Task-Manager/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.ts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.tsx
│
└── README.md
```

---

# Environment Variables

## Backend `.env`

```env
PORT=5000
NODE_ENV=production

DATABASE_URL=your_neon_database_url

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

CLIENT_URL=your_frontend_url
```

---

## Frontend `.env`

```env
VITE_API_URL=your_backend_url/api
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/your-username/Ethara-AI-Team-Task-Manager.git
```

---

## Backend Setup

```bash
cd backend
npm install
```

### Run Prisma Migration

```bash
npx prisma generate
npx prisma db push
```

### Start Backend

```bash
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

### Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# Production Deployment

## Frontend Deployment

* Railway
* Root Directory: `frontend`

## Backend Deployment

* Railway
* Root Directory: `backend`

## Database

* Neon PostgreSQL

---

# API Endpoints

## Authentication

```http
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

---

## Projects

```http
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

---

## Tasks

```http
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id/status
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

# Validation & Security

* Zod Request Validation
* JWT Verification Middleware
* Protected API Routes
* Role Authorization Middleware
* Secure Password Hashing
* Environment Variable Protection

---

# Future Improvements

* Team Invitations
* File Upload Support
* Activity Logs
* Email Notifications
* Real-Time Collaboration
* Kanban Board View
* Search & Filtering Enhancements

---

# Author

**Supriya Mishra**

GitHub:
`https://github.com/supriya4748`

---

# License

This project is developed for educational, portfolio, and assessment purposes.
