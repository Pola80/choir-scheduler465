# Choir Scheduler - Backend

This is a minimal Express backend used by the Choir Scheduler app. It provides simple in-memory storage for rehearsals and is suitable for local development or deploying to Cloud Run.

To run locally:

```bash
cd backend
npm install
npm start
```

To build and run a Docker image locally:

```bash
docker build -t choir-backend:local .
docker run -p 3000:3000 choir-backend:local
```

To deploy to Cloud Run (example):

```bash
# from repo root or backend/
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/choir-backend
gcloud run deploy choir-backend --image gcr.io/YOUR_PROJECT_ID/choir-backend --platform managed --region us-central1 --allow-unauthenticated
```

Replace `YOUR_PROJECT_ID` with your GCP project id.

CI / GitHub Actions
-------------------
This repo includes a GitHub Actions workflow at `.github/workflows/deploy-cloud-run.yml` which will build and deploy the backend to Cloud Run when you push to `main`.

Before enabling the workflow, add the following GitHub secrets to your repository settings:

- `GCP_SA_KEY`: the JSON service account key with permissions to run Cloud Build and deploy to Cloud Run.
- `GCP_PROJECT`: your GCP project ID.

Make sure the service account has the following roles (at least):
- Cloud Run Admin (roles/run.admin)
- Cloud Build Editor (roles/cloudbuild.builds.editor) or Cloud Build Service Account
- Storage Admin or Artifact Registry Writer (if using Artifact Registry)

The workflow will run `gcloud builds submit` and then `gcloud run deploy`.

# Choir Scheduler Backend

Simple Express backend used for local development. It stores rehearsals in memory (non-persistent).

To run:

1. Install dependencies:

   npm install

2. Start server:

   npm start

The server listens on port 3000 by default.

Notes for mobile emulators:
- Android emulator (default) can reach the host machine at `10.0.2.2` — this project uses that as `API_BASE`.
- For a physical device, use your machine's LAN IP and ensure both device and host are on the same network.
- This is a README file for the deployment of the choir application

