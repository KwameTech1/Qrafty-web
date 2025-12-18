# QRAFTY

QRAFTY is a QR-based digital identity + B2B interaction platform.

## Repo structure

- frontend/web: React + Vite + TypeScript + Tailwind + React Router
- backend/api: Node.js + Express + TypeScript + PostgreSQL (via Prisma)

## Local development

### 1) Start Postgres

Run:

`docker compose up -d`

### 2) Configure environment

- Copy backend/api/.env.example to backend/api/.env and set values
- Copy frontend/web/.env.example to frontend/web/.env (optional for now)

### 3) Install dependencies

Run:

`npm install --no-progress`

### 4) Start the apps

Run:

`npm run dev`

Or run individually:

`npm run dev:web`

`npm run dev:api`

Web: http://localhost:5173

API health check: http://localhost:4000/health
