# Choir Scheduler

A full-stack mobile and backend application for managing choir rehearsals. Built with React Native (Expo), Express.js, and deployed to Google Cloud Platform.

## Project Structure

```
choir-scheduler/
├── App.js                          # Main Expo app entry point
├── package.json                    # Frontend dependencies
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Main rehearsal list screen
│   │   ├── CreateRehearsalScreen.js # Create new rehearsal
│   │   └── RehearsalDetailsScreen.js # View/edit rehearsal details
│   └── storage/
│       └── rehearsalStorage.js     # API client with AsyncStorage fallback
├── backend/
│   ├── server.js                   # Express backend server
│   ├── package.json                # Backend dependencies
│   ├── Dockerfile                  # Container image definition
│   └── README.md                   # Backend deployment guide
├── cloudbuild.yaml                 # Cloud Build config (Container Registry)
├── cloudbuild-artifact.yaml        # Cloud Build config (Artifact Registry)
├── .github/
│   └── workflows/
│       └── deploy-cloud-run.yml    # GitHub Actions CI/CD workflow
└── README.md                       # This file
```

## Features

- **Mobile App (React Native / Expo)**
  - Create, view, edit, and delete choir rehearsals
  - Schedule rehearsals with date and time
  - View rehearsal details and participants
  - Offline support via AsyncStorage (data syncs when backend is available)

- **Backend (Node.js / Express)**
  - RESTful API for rehearsal management
  - CORS-enabled for mobile and web clients
  - In-memory storage (can be extended with database)
  - Deployed on Google Cloud Run (serverless)

- **CI/CD**
  - GitHub Actions workflow for automatic deployment
  - Cloud Build configuration for image building
  - Artifact Registry integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud SDK (gcloud) installed and configured
- Android Studio or Xcode (for local mobile testing)
- Expo CLI (`npx expo`)
- GitHub account (for CI/CD)

### Frontend Setup (Local Development)

1. Install dependencies:
```bash
npm install
```

2. Start Expo development server:
```bash
npx expo start -c
```

3. Open in Expo Go (mobile) or browser:
   - For Android emulator: Press `a`
   - For iOS simulator: Press `i`
   - For web: Press `w`

### Backend Setup (Local Development)

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend will run on `http://localhost:3000`.

4. Test the API:
```bash
curl http://localhost:3000/health
# Should return: {"ok":true}
```

### Update Frontend API Endpoint

In `src/storage/rehearsalStorage.js`, set your backend URL:

```javascript
let CLOUD_RUN_URL = 'https://YOUR_CLOUD_RUN_URL.a.run.app';
```

Replace `YOUR_CLOUD_RUN_URL` with your actual Cloud Run service URL.

## Deployment

### Deploy Backend to Google Cloud Run

#### Option 1: Using Google Cloud Shell (Recommended)

1. Open [Google Cloud Shell](https://console.cloud.google.com) (>_ icon in top-right)

2. Set your project:
```bash
gcloud config set project YOUR_PROJECT_ID
```

3. Enable required APIs:
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com iam.googleapis.com
```

4. Create Artifact Registry repository:
```bash
gcloud artifacts repositories create choir-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Backend docker repo"
```

5. Clone your repository and deploy:
```bash
git clone https://github.com/YOUR_USERNAME/choir-scheduler.git
cd choir-scheduler

gcloud builds submit --config cloudbuild-artifact.yaml \
  --substitutions=_REGION=us-central1,_REPO_LOCATION=us-central1,_REPOSITORY=choir-repo
```

6. Get your Cloud Run service URL:
```bash
gcloud run services describe choir-backend --region us-central1 --format='value(status.url)'
```

#### Option 2: Automatic Deployment with GitHub Actions

1. Create a GCP service account with these roles:
   - Cloud Run Admin (roles/run.admin)
   - Cloud Build Editor (roles/cloudbuild.builds.editor)
   - Artifact Registry Writer (roles/artifactregistry.writer)

2. Download the JSON key for the service account

3. Add GitHub repository secrets:
   - `GCP_SA_KEY`: Paste the contents of the JSON key
   - `GCP_PROJECT`: Your GCP project ID

4. Push to `main` branch — the workflow will automatically build and deploy:
```bash
git push origin main
```

### Deploy Frontend (Optional: Web Build to GCS)

1. Build Expo web:
```bash
npx expo build:web
```

2. Create a GCS bucket:
```bash
gsutil mb -l us-central1 gs://your-unique-bucket-name
```

3. Upload web build:
```bash
gsutil -m cp -r web-build/* gs://your-unique-bucket-name/
```

4. Enable static website hosting:
```bash
gsutil web set -m index.html gs://your-unique-bucket-name
```

### Build Mobile App for Distribution

1. Build Android AAB for Play Store:
```bash
npx eas build --platform android --profile production
```

2. Build iOS IPA for App Store:
```bash
npx eas build --platform ios --profile production
```

3. Download the generated binaries and submit to respective app stores

## API Endpoints

Base URL: `https://YOUR_CLOUD_RUN_URL.a.run.app`

### Health Check
- **GET** `/health` — Check backend health
  - Response: `{"ok":true}`

### Rehearsals
- **GET** `/rehearsals` — List all rehearsals
- **POST** `/rehearsals` — Create new rehearsal
  - Body: `{"id": "...", "date": "...", "time": "...", "location": "..."}`
- **GET** `/rehearsals/:id` — Get rehearsal by ID
- **DELETE** `/rehearsals/:id` — Delete rehearsal

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │  ◄──────► Expo Go / Dev Client / APK
├─────────────────┤
│ rehearsalStorage│ ◄──────► AsyncStorage (offline cache)
│    (API client) │
└────────┬────────┘
         │ HTTPS
         │
    ┌────▼─────────┐
    │  Cloud Run   │ ◄──────► Artifact Registry
    │   Backend    │          (Docker Image)
    │  (Express)   │
    └──────────────┘
```

## Offline Support

The app automatically falls back to AsyncStorage if the backend is unavailable:
- All reads/writes first try the backend API
- If the API fails, data is stored locally in AsyncStorage
- When the backend comes back online, data can be re-synced

## Development Notes

- **Backend Database**: Currently uses in-memory storage. For production, integrate a database (Cloud SQL, Firestore, etc.)
- **Authentication**: No authentication implemented yet. Add OAuth/JWT for production.
- **Image Compression**: Use the `image-compressor.html` tool to compress images before uploading.

## Troubleshooting

### Backend not responding
1. Check Cloud Run service is deployed:
   ```bash
   gcloud run services list --region us-central1
   ```
2. Check logs:
   ```bash
   gcloud run services logs read choir-backend --region us-central1
   ```
3. Ensure `CLOUD_RUN_URL` in `src/storage/rehearsalStorage.js` is correct

### Build failures
1. Check Cloud Build logs in GCP Console
2. Verify `cloudbuild-artifact.yaml` has correct substitutions
3. Ensure Artifact Registry repository exists

### Mobile app can't reach backend
1. For local backend: Use `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000` (simulator)
2. For Cloud Run: Ensure the service is public (`--allow-unauthenticated`)
3. Check mobile device can access the internet

## Next Steps

1. ✅ Deploy backend to Cloud Run
2. ✅ Update frontend API endpoint
3. 🔄 Test mobile app with backend
4. 📦 Build and publish mobile app to Play Store/App Store
5. 🔐 Add authentication (OAuth/JWT)
6. 💾 Integrate production database
7. 📊 Set up monitoring and logging

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact the development team.
