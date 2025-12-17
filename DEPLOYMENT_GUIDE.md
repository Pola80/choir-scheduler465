# Choir Scheduler - Complete Deployment Guide

## Overview
This guide covers deploying both the React Native frontend and Node.js backend to production.

---

## 🚀 Current Deployment Status (Updated Dec 17, 2025)

### ✅ Completed
- **Phase 2.1-2.6**: Backend deployed to Cloud Run with PostgreSQL integration
  - Endpoint: https://choir-backend-925038690128.us-central1.run.app
  - Database: PostgreSQL 15 on Cloud SQL (choir-scheduler-deploy:us-central1:choir-db)
  - Status: API endpoints tested and working (POST, GET, DELETE)
  
- **Phase 3.1-3.2**: Frontend configured with production backend
  - API configuration: `src/config.js` created with backend URL
  - Storage layer: `src/storage/rehearsalStorage.js` updated to use production API
  - app.json: Updated with EAS project ID and production configuration

- **Phase 3.3**: EAS build setup initiated
  - EAS project initialized: @polabass/choir-scheduler (ID: 93b8ca51-06bc-4b14-bcb4-3868f21a8691)
  - Build profiles configured (development, preview, production)
  - Android development build in progress on EAS
  - Asset images created and committed

### 🔄 In Progress
- **Android Build**: Development build submitted to EAS (Build ID: 14f0bd44-47bf-441c-8f7c-7621809ffc47)
  - Status: In progress
  - ETA: ~10-15 minutes
  
### ⏭️ Next Steps
- **Step 3.3 (continued)**: Monitor build completion and download build artifacts
- **Step 3.4**: Submit apps to App Stores (requires Apple Developer account with paid membership)
- **Step 3.5**: Configure app store listings and metadata

### ⚠️ Notes
- iOS build requires paid Apple Developer membership (not available for this account)
- Android development build is available for internal testing
- Production builds will be available after development build succeeds

---

## PHASE 1: Pre-Deployment Setup (Week 1)

### Step 1.1: Set Up Google Cloud Project
```bash
# Install Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Create a new project
gcloud projects create choir-scheduler-prod --name="Choir Scheduler"

# Set the project as default
gcloud config set project choir-scheduler-prod

# IMPORTANT: Enable billing on your project FIRST
# 1. Go to: https://console.cloud.google.com/billing/linkedaccount
# 2. Create or select a billing account
# 3. Link it to your choir-scheduler-prod project
# 4. Once billing is enabled, proceed below

# Enable required APIs (only works after billing is enabled)
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 1.2: Set Up Expo Account & EAS
```bash
# Create Expo account at https://expo.dev

# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Link your project to Expo
eas project:init
# This will generate app.json if it doesn't exist
```

### Step 1.3: Configure Database
**Choose one:**

**Option A: Firebase Firestore (Easiest)**
```bash
# Set up Firebase project at https://firebase.google.com
# 1. Create a new Firebase project
# 2. Enable Firestore Database
# 3. Enable Authentication
# 4. Get credentials for backend

npm install firebase-admin
```

**Option B: PostgreSQL on Cloud SQL**
```bash
# Create Cloud SQL instance
gcloud sql instances create choir-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create choir_scheduler \
  --instance=choir-db

# Note credentials for backend
```

**Option C: MongoDB Atlas (Free tier available)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string

### Step 1.4: Create app.json Configuration
```bash
# Update/create app.json in root directory
cat > app.json << 'EOF'
{
  "expo": {
    "name": "Choir Scheduler",
    "slug": "choir-scheduler",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.choirscheduler.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.choirscheduler.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
EOF
```

---

## PHASE 2: Backend Deployment (Week 2)

### Step 2.1: Prepare Backend Code
```bash
# Navigate to backend directory
cd backend

# Update server.js to use database
# (See backend integration examples below)

# Test locally
npm install
npm start
# Visit http://localhost:3000/health
```

### Step 2.2: Create Dockerfile
```bash
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF
```

### Step 2.3: Set Up Cloud Build Trigger
```bash
# Enable Cloud Build API first
gcloud services enable cloudbuild.googleapis.com

# Connect GitHub repository to Cloud Build
# (Use Cloud Console for easier setup: https://console.cloud.google.com/cloud-build/triggers)
# Manual command (may require interactive setup):
gcloud builds connect --repository-name=choir-scheduler465 \
  --repository-owner=Pola80 \
  --region=us-central1

# Or use the Cloud Console to:
# 1. Go to: https://console.cloud.google.com/cloud-build/triggers
# 2. Click "Create Trigger"
# 3. Connect your GitHub repo
# 4. Configure trigger:
#    - Name: Deploy Choir Backend
#    - Event: Push to branch
#    - Branch: ^main$
#    - Build configuration: Cloud Build configuration file
#    - Location: cloudbuild.yaml
#    - Substitutions: _REGION=us-central1
```

### Step 2.4: Deploy Backend to Cloud Run
```bash
# Option A: Using existing cloudbuild.yaml
# Push to main branch and Cloud Build will auto-deploy
git add .
git commit -m "Deploy: backend to Cloud Run"
git push origin feature/todo

# Create PR to main, merge to trigger deployment

# Option B: Manual deployment
cd backend
gcloud builds submit --config=../cloudbuild.yaml

# After deployment, note the Cloud Run service URL
# Example: https://choir-backend-xxxxx.run.app
```

### Step 2.5: Database Setup (Backend)
**For PostgreSQL:**
```javascript
// backend/server.js - Add database connection
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Update endpoints to use pool instead of in-memory array
```

**For Firebase:**
```javascript
// backend/server.js
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Update endpoints to use Firestore
```

### Step 2.6: Set Environment Variables in Cloud Run
```bash
gcloud run services update choir-backend \
  --region us-central1 \
  --update-env-vars DB_HOST=your-db-host,DB_USER=your-user,DB_PASSWORD=your-password,DB_NAME=choir_scheduler,DB_PORT=5432
```

---

## PHASE 3: Frontend Deployment (Week 3)

### Step 3.1: Update Frontend Configuration
```bash
# Update src/config.js with backend URL
cat > src/config.js << 'EOF'
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://choir-backend-xxxxx.run.app';
EOF

# Update storage to use API if available
# See frontend integration examples below
```

### Step 3.2: Update app.json for Production
```json
{
  "expo": {
    "version": "1.0.0",
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      },
      "apiUrl": "https://choir-backend-xxxxx.run.app"
    }
  }
}
```

### Step 3.3: Build Standalone Apps with EAS

**For iOS:**
```bash
# Build for iOS App Store
eas build --platform ios --auto-submit

# Or without auto-submit (manual review):
eas build --platform ios

# After build completes, submit to App Store
eas submit --platform ios

# Requirements:
# - Apple Developer Account ($99/year)
# - Apple Certificates (handled by EAS)
```

**For Android:**
```bash
# Build for Google Play Store
eas build --platform android --auto-submit

# Or without auto-submit:
eas build --platform android

# After build completes, submit to Play Store
eas submit --platform android

# Requirements:
# - Google Play Developer Account ($25 one-time)
# - Signed APK/AAB (handled by EAS)
```

**For Both Platforms:**
```bash
# Build both simultaneously
eas build --platform all

# Check build status
eas build:list

# Watch build progress
eas build:view <BUILD_ID>
```

### Step 3.4: App Store Submissions

**iOS App Store:**
1. Create app record in App Store Connect
2. Fill in app information:
   - Name, subtitle, description
   - Category (Productivity/Utilities)
   - Age rating
   - Screenshots & preview video
   - App icon & launch screen
   - Support & privacy info
3. Run `eas submit --platform ios`
4. Review takes 24-48 hours

**Google Play Store:**
1. Create app in Google Play Console
2. Fill in app information:
   - Title, short description, full description
   - Screenshots (minimum 2 phones, 1 tablet)
   - Feature graphic (1024x500px)
   - Icon, banner
3. Run `eas submit --platform android`
4. Can be live within hours

---

## PHASE 4: Post-Deployment (Week 4+)

### Step 4.1: Set Up Monitoring
```bash
# Cloud Monitoring for backend
gcloud monitoring dashboards create --config-from-file=dashboard.yaml

# View logs
gcloud run services describe choir-backend --region us-central1
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=choir-backend" --limit 50
```

### Step 4.2: Analytics & Crash Reporting
```bash
# Install Sentry for error tracking
npm install @sentry/react-native

# In App.js:
import * as Sentry from "@sentry/react-native";
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
});
```

### Step 4.3: Set Up CI/CD for Updates
```bash
# Every push to main triggers:
# 1. Backend builds & deploys to Cloud Run
# 2. Frontend builds & can auto-submit to stores

# Manual app update process:
# 1. Create PR with changes
# 2. Code review & merge to main
# 3. Cloud Build auto-deploys backend
# 4. Run: eas build --platform all
# 5. Run: eas submit --platform all
```

### Step 4.4: Monitoring & Maintenance

**Daily:**
- Check Cloud Logging for errors
- Monitor Cloud Run metrics (response time, errors)
- Review analytics for user issues

**Weekly:**
- Security updates for dependencies
- Database backups verification
- Performance review

**Monthly:**
- Update documentation
- Plan new features
- Review App Store reviews & ratings
- Security audit

---

## Deployment Checklist

### Pre-Deployment
- [ ] Firebase/Database configured
- [ ] Google Cloud project created
- [ ] GitHub connected to Cloud Build
- [ ] Expo project initialized
- [ ] app.json configured
- [ ] Apple/Google Developer accounts ready
- [ ] Environment variables set up

### Backend
- [ ] Dockerfile created & tested
- [ ] Database migrations tested
- [ ] cloudbuild.yaml configured
- [ ] Cloud Run deployment successful
- [ ] API endpoints tested with curl/Postman
- [ ] Health check returning 200

### Frontend
- [ ] API_URL environment variables set
- [ ] All screens tested on actual devices
- [ ] Permissions configured (location, camera, contacts, etc.)
- [ ] App icons & splash screens created
- [ ] App.json metadata complete
- [ ] Build successful on EAS

### App Stores
- [ ] App Store Connect account set up (iOS)
- [ ] Google Play Console account set up (Android)
- [ ] All store metadata filled in
- [ ] Screenshots & descriptions ready
- [ ] Privacy policy & terms URLs ready
- [ ] App submitted & in review

### Post-Launch
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics enabled (Firebase Analytics, Mixpanel, etc.)
- [ ] Monitoring dashboards created
- [ ] Support email configured
- [ ] Social media announced
- [ ] Documentation updated

---

## Timeline Estimate

| Phase | Duration | Start Date | End Date |
|-------|----------|-----------|----------|
| Phase 1: Setup | 3-5 days | Week 1 | Week 1 |
| Phase 2: Backend | 3-5 days | Week 2 | Week 2 |
| Phase 3: Frontend | 5-7 days | Week 3 | Week 3 |
| Phase 4: Post | Ongoing | Week 4+ | Ongoing |

**Total to First Release:** ~3-4 weeks

---

## Cost Estimates (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|-----------------|
| Cloud Run | 2M requests | $0-20 |
| Cloud SQL | 10GB storage | $0-20 |
| Firebase Firestore | 1GB storage | $0-5 |
| Apple Developer | - | $99/year |
| Google Play Developer | - | $25 one-time |
| Monitoring & Logging | Some free | $0-10 |
| **Total** | | **$0-55/month** |

---

## Troubleshooting

### Backend Won't Deploy
```bash
# Check build logs
gcloud builds log <BUILD_ID>

# Check Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 20

# Verify Dockerfile
docker build ./backend -t choir-backend:test
docker run -p 3000:3000 choir-backend:test
```

### Frontend Build Fails
```bash
# Clear EAS cache
eas build:cache:view
eas build:cache:delete

# Rebuild with verbose output
eas build --platform ios --verbose
```

### App Store Rejection
- Check App Store guidelines
- Ensure privacy policy URL is valid
- Remove test accounts/data
- Test all features work without crashes

---

## Additional Resources

- Expo Deployment: https://docs.expo.dev/build/setup/
- EAS Submit: https://docs.expo.dev/submit/submitting-to-app-stores/
- Cloud Run: https://cloud.google.com/run/docs
- Cloud Build: https://cloud.google.com/build/docs
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/about/developer-content-policy/
