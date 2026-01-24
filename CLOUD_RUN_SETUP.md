# Google Cloud Run Deployment Guide (Free Tier)

This guide deploys your Qrafty app on **Google Cloud Run** (API) with **Cloud SQL** (PostgreSQL) - both with generous free tiers.

## Prerequisites

1. **Google Cloud Account** (free tier: https://cloud.google.com/free)
2. **Google Cloud CLI** installed (https://cloud.google.com/sdk/docs/install)
3. **Docker** installed (for testing locally)

## Step 1: Create a Google Cloud Project

```bash
# Create a new project
gcloud projects create qrafty-api --name="Qrafty API"

# Set it as default
gcloud config set project qrafty-api
```

Or use the [Google Cloud Console](https://console.cloud.google.com) to create a project.

## Step 2: Set Up Cloud SQL PostgreSQL

```bash
# Create a Cloud SQL PostgreSQL instance
gcloud sql instances create qrafty-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create a database
gcloud sql databases create qrafty-dev --instance=qrafty-db

# Create a database user
gcloud sql users create qrafty-user \
  --instance=qrafty-db \
  --password

# Get connection name (you'll need this later)
gcloud sql instances describe qrafty-db --format="value(connectionName)"
# Output will look like: qrafty-api:us-central1:qrafty-db
```

## Step 3: Set Up Cloud Run Service Account

```bash
# Create a service account
gcloud iam service-accounts create qrafty-api-sa \
  --display-name="Qrafty API Service Account"

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding qrafty-api \
  --member=serviceAccount:qrafty-api-sa@qrafty-api.iam.gserviceaccount.com \
  --role=roles/cloudsql.client
```

## Step 4: Build and Deploy to Cloud Run

```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build the container image
gcloud builds submit --tag gcr.io/qrafty-api/qrafty-api:latest

# Deploy to Cloud Run
gcloud run deploy qrafty-api \
  --image gcr.io/qrafty-api/qrafty-api:latest \
  --platform managed \
  --region us-central1 \
  --service-account qrafty-api-sa \
  --add-cloudsql-instances qrafty-api:us-central1:qrafty-db \
  --set-env-vars "DATABASE_URL=postgresql://qrafty-user:PASSWORD@/qrafty-dev?host=/cloudsql/qrafty-api:us-central1:qrafty-db" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "CLERK_SECRET_KEY=YOUR_CLERK_KEY" \
  --set-env-vars "CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY" \
  --set-env-vars "WEB_ORIGIN=https://your-vercel-app.vercel.app" \
  --port 3001 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --timeout 60
```

Replace placeholders:

- `PASSWORD`: Your chosen database password
- `YOUR_CLERK_KEY`: Your Clerk secret key
- `YOUR_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `https://your-vercel-app.vercel.app`: Your Vercel frontend URL

## Step 5: Update Vercel Frontend

Update your Vercel environment variable:

```
VITE_API_URL=https://qrafty-api-XXXXX.run.app
```

Or keep using `/api` proxy if configured in Vercel.

## Step 6: Test Health Endpoint

```bash
# Get your Cloud Run URL from the deployment output
curl https://qrafty-api-XXXXX.run.app/health
```

Should return `OK` if working.

## Monitoring & Logs

```bash
# View logs
gcloud run logs read qrafty-api --region us-central1 --limit 50

# View metrics
gcloud run describe qrafty-api --region us-central1
```

## Cost Breakdown (Free Tier)

**Cloud Run**:

- 2,000,000 requests/month free ✅
- 360,000 vCPU-seconds/month free
- 180,000 GiB-seconds/month free

**Cloud SQL**:

- 1 shared PostgreSQL instance free ✅
- Up to 10 GB storage free
- 100 connections

**Total**: Completely FREE as long as you stay within these limits.

## Scaling Notes

Cloud Run automatically scales from 0 to your specified limits:

- Cold starts: ~1-2 seconds (acceptable for hobby project)
- Auto-scales under load
- Pay only for what you use

## Next Steps

1. Deploy frontend to Vercel (if not already done)
2. Test the full flow (login, QR creation, marketplace)
3. Monitor costs in Google Cloud Console
4. When user base grows, consider paid tiers or dedicated instances

## Troubleshooting

**Database connection fails**:

```bash
# Check Cloud SQL instance is running
gcloud sql instances describe qrafty-db

# Verify Cloud SQL Proxy has Cloud SQL Client role
gcloud projects get-iam-policy qrafty-api
```

**Migrations not running**:

- Check logs: `gcloud run logs read qrafty-api`
- Ensure `DATABASE_URL` is correct
- Verify database user password is correct

**Service account permission errors**:

```bash
gcloud projects get-iam-policy qrafty-api \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:qrafty-api-sa@*"
```
