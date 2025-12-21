# Deployment (Vercel + Render)

This repo is a monorepo with:

- Frontend: `frontend/web` (Vite + React)
- Backend: `backend/api` (Express + Prisma)

## Backend (Render)

### 1) Create Render resources

- Create a **PostgreSQL** database.
- Create a **Web Service** for the API.

If you use `render.yaml`, Render can provision both.

### 2) Environment variables (Render)

Set these env vars on the API service:

- `DATABASE_URL` (Render provides this if you connect the database)
- `WEB_ORIGIN` = your Vercel URL, e.g. `https://your-app.vercel.app`
- `CLERK_SECRET_KEY`

Optional (only if using Google sign-in):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URL` = `https://<your-render-api-domain>/auth/google/callback`

### 3) Run migrations (Render)

When deploying to production, use:

- `npm run prisma:migrate:deploy`

You can run it from a Render one-off shell, or add it as a manual step during first deploy.

## Frontend (Vercel)

### 1) Import project

In Vercel, import the repo and set:

- **Root Directory**: `frontend/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2) Environment variables (Vercel)

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL` = your Render API base URL, e.g. `https://qrafty-api.onrender.com` (optional in production; the web app uses `/api` proxy by default)

### 3) Clerk dashboard settings (production + dev)

In the Clerk Dashboard for your application, add these so redirects and token requests work for your deployed domains.

**Production domain**

- Base domain: `https://qrafty-web.vercel.app`
- Allowed origins (sometimes called “Allowed origins” / “Authorized origins”):
  - `https://qrafty-web.vercel.app`
- Allowed redirect URLs (sometimes called “Redirect URLs”):
  - `https://qrafty-web.vercel.app/login`
  - `https://qrafty-web.vercel.app/signup`
  - `https://qrafty-web.vercel.app/app`

If Clerk supports wildcard redirect patterns in your dashboard, you can use:

- `https://qrafty-web.vercel.app/*`

**Local dev**

- Allowed origins:
  - `http://localhost:5173`
- Allowed redirect URLs:
  - `http://localhost:5173/login`
  - `http://localhost:5173/signup`
  - `http://localhost:5173/app`

If wildcard redirects are supported, you can use:

- `http://localhost:5173/*`

### 4) SPA routing

`frontend/web/vercel.json` includes a rewrite so routes like `/app/marketplace` work on refresh.

## Quick sanity checks

- API health: `GET https://<api-domain>/health`
- Web loads and login/signup works
- QR public page loads: `/p/:publicId`
