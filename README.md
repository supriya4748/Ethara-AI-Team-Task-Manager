# Ethara AI Team Task Manager

A full-stack premium Team Task Manager designed with high aesthetic standards, robust type-safety, and a modern clean architecture.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **Validation**: Zod
- **Deployment**: Railway Ready

---

## Directory Structure

```text
ethara-ai-task-manager/
├── backend/                  # Express + Node.js + TS Backend
│   ├── prisma/               # Database schemas & migrations
│   │   └── schema.prisma     # Prisma data models
│   ├── src/
│   │   ├── config/           # Database, environment configurations
│   │   ├── controllers/      # Route request controllers
│   │   ├── middlewares/      # Error handler, JWT guard, Zod validator
│   │   ├── routes/           # Routing layers (auth, tasks, projects)
│   │   ├── services/         # Core business logic layer
│   │   ├── utils/            # Helper utilities (logger, tokens)
│   │   ├── validators/       # Input validation schemas
│   │   └── server.ts         # App entrypoint
│   ├── .env.example          # Environment template
│   ├── tsconfig.json         # TS Compiler options
│   └── package.json          # Dependency management
│
├── frontend/                 # React + Vite + TS Frontend
│   ├── src/
│   │   ├── assets/           # Global styles, images, and brand files
│   │   ├── components/       # Shared UI components (button, card, sidebar)
│   │   ├── context/          # State managers (AuthContext, etc.)
│   │   ├── layouts/          # Layout wrappers (DashboardLayout, AuthLayout)
│   │   ├── pages/            # View components (Dashboard, Login, Signup)
│   │   ├── routes/           # React Router mappings and route guards
│   │   ├── services/         # Axios API service layers
│   │   ├── App.tsx           # Global container and routing shell
│   │   └── main.tsx          # React application mount
│   ├── .env.example          # Frontend env variables
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── tsconfig.json         # TS compiler setup
│   └── package.json          # Dependency management
└── README.md                 # Project starter documentation
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database instance

### Setup & Installation

Detailed startup and migration guides will be populated in subsequent phases.
For Phase 0 verification:

1. **Backend Build**:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Frontend Build**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
