# Step 3.4: Google Play Store Submission - Complete Guide

## Overview
This guide walks you through submitting the Choir Scheduler app to Google Play Store for production release.

## Prerequisites

### 3.4.1 Google Play Developer Account
**Status**: ⏳ Required (not yet created)

1. Visit: https://play.google.com/console
2. Sign in with your Google account (or create one)
3. Pay **$25 one-time registration fee**
4. Complete your developer profile:
   - Developer name
   - Developer email
   - Website (optional)
   - Phone number
   - Address

### 3.4.2 Service Account Setup
Once developer account is created:

1. Go to **Google Play Console → Setup → API access**
2. Click **Create new service account**
3. Follow Google Cloud setup wizard
4. Download the **JSON key file** and save as `google-play-key.json` in project root
5. Grant **Owner** role to service account
6. Add to `.gitignore`:
   ```
   google-play-key.json
   *.aab
   *.apk
   ```

### 3.4.3 Build Artifact
You need either:
- **AAB (Android App Bundle)** ✅ Recommended for Play Store
- **APK** ⚠️ Legacy, less optimized

**Current Status**: 
- EAS builds failing (need to resolve or use local build)
- Option A: Debug and fix EAS configuration
- Option B: Build locally with `eas build --platform android --local`

---

## Step 3.4.4: Create App Listing in Google Play Console

### 4a. Create New App

1. Open https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - **App name**: "Choir Scheduler"
   - **Default language**: English (US)
   - **App or game**: Select "App"
   - **Paid/Free**: Free
   - **Type**: Yes, it's an app (not a game)

### 4b. Complete App Information

Navigate to: **App details**

| Field | Value |
|-------|-------|
| **App name** | Choir Scheduler |
| **Short description** | Manage rehearsals and member availability |
| **Full description** | Choir Scheduler helps choir directors organize rehearsals, track member attendance, and manage schedules efficiently. Features: Create rehearsals, Track availability, Schedule management, Real-time updates, Member communication. |
| **Category** | Productivity |
| **Content rating** | See section 4c below |

### 4c. Complete Store Listing

Navigate to: **Store presence → Store listing**

1. **App title**: "Choir Scheduler" (50 chars max)
2. **Short description**: "Manage rehearsals & member availability" (80 chars max)
3. **Full description**: (4000 chars max)
   ```
   Choir Scheduler is a mobile app designed for choir directors and members.
   
   Features:
   • Create and manage rehearsal sessions
   • Track member availability and attendance
   • Schedule rehearsals with automatic notifications
   • View rehearsal details and locations
   • Real-time synchronization across devices
   
   Perfect for:
   - Community choirs
   - School choirs
   - Professional vocal groups
   - Rehearsal coordinators
   
   Simplify your choir management today!
   ```

4. **Screenshots** (minimum 2-8 per device type):
   - **Phones**: 1080×1920 px (9:16 aspect ratio)
   - **7-inch tablets**: 1200×1920 px
   - Format: PNG or JPEG
   - Upload 2-3 screenshots showing:
     - Home screen
     - Rehearsal creation flow
     - Rehearsal details view

5. **Feature Graphic**: 1024×500 px
   - Marketing image highlighting key features
   - Optional but recommended

6. **App Icon**: 512×512 px
   - Already in `assets/icon.png`
   - Must be PNG
   - No transparency required for Play Store

### 4d. Content Rating Questionnaire

Navigate to: **Content → Content rating**

1. Click **Set up questionnaire**
2. Select category: **Productivity**
3. Answer questions honestly (typically all "No" for this app)
4. Get IARC rating certificate
5. Save rating

### 4e. Privacy & Permissions

Navigate to: **App content**

1. **Privacy policy**: 
   - Required for production release
   - Add URL or use Google's template at: https://support.google.com/googleplay/answer/9888170
   
2. **Target audience**:
   - Select: "Not intended for children"
   
3. **Permissions**:
   - Review requested permissions in AndroidManifest.xml
   - Justify each permission in Play Store

---

## Step 3.4.5: Upload Build & Create Release

### 5a. Prepare Build Artifact

**Option A: Use EAS build (if available)**
```bash
# Check if any builds completed
eas build:view <BUILD_ID>

# Download AAB if build succeeded
eas build:download --build-id <BUILD_ID> --path ./choir-scheduler.aab
```

**Option B: Build locally**
```bash
cd ~/Projects/choir-scheduler
eas build --platform android --profile production --local
# This will output: choir-scheduler-1.0.0.aab
```

### 5b. Create Production Release

In Google Play Console:

1. Navigate to: **Release → Production**
2. Click **Create new release**
3. **Add AAB files**:
   - Click "Browse files"
   - Upload `choir-scheduler.aab`
   - Wait for automated scanning (~5-10 min)
4. **Release notes** (optional):
   ```
   Version 1.0.0 - Initial Release
   
   • Rehearsal creation and management
   • Member availability tracking
   • Real-time synchronization
   • Attendance recording
   ```
5. Click **Save**

---

## Step 3.4.6: Review & Submit

### 6a. Pre-Submission Checklist

- [ ] App title & description complete
- [ ] Screenshots uploaded (2-8 per device)
- [ ] Feature graphic uploaded
- [ ] App icon set
- [ ] Content rating completed
- [ ] Privacy policy URL added
- [ ] Build AAB uploaded & scanned
- [ ] Release notes added
- [ ] Permissions reviewed & justified
- [ ] Target audience set correctly

### 6b. Submit for Review

1. In Google Play Console, go to **Release → Production**
2. Click **Review release** (or **Submit release** if showing)
3. Verify all information is correct
4. Click **Start rollout to Production** (or **Submit**)

**What happens next**:
- Google Play team reviews (typically 2-4 hours, often same day)
- Automated checks run
- Manual review by humans
- You receive email notification
- App goes live on Play Store

---

## Step 3.4.7: Post-Submission Monitoring

### 7a. Track Submission Status

In Google Play Console:
1. **Release → Production**: See current status
2. **Analytics**: Monitor crash rates & performance
3. **User feedback**: Read reviews and respond
4. **Ratings**: Track star rating (target: 4.0+)

### 7b. Monitor Analytics

- **Installs**: Track daily/weekly installs
- **Crashes**: Set up crash reporting
- **Performance**: Monitor ANRs and slow frames
- **Retention**: Track 1-day/7-day retention

### 7c. Respond to User Reviews

1. In **Ratings & reviews**:
   - Read user feedback
   - Respond to issues professionally
   - Acknowledge praise

---

## Troubleshooting

### Build Won't Submit
```
Error: "Build is not signed"
Solution: Ensure EAS keystore is configured in eas.json
```

### Screenshots Not Uploading
```
Requirement: Exact dimensions (1080×1920 for phones, 1200×1920 for tablets)
Solution: Use online image resizer or Photoshop
```

### "App suspended due to policy violation"
```
Common causes:
- Broken links in privacy policy
- Misleading description
- Crash on startup
- Excessive permissions without justification

Solution: Fix issue and appeal through console
```

### Release Stuck in "Pending Publication"
```
This is normal - can take 1-24 hours
Check console for any blocking issues
```

---

## Security Checklist

- [ ] Never commit `google-play-key.json` to git
- [ ] Rotate credentials if ever exposed
- [ ] Use different service accounts for dev/prod
- [ ] Ensure app permissions are justified
- [ ] Review privacy policy before submission
- [ ] Test app thoroughly before submission

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Create Play Account | 15 min | ⏳ TODO |
| Set up Service Account | 10 min | ⏳ TODO |
| Create App Listing | 30 min | ⏳ TODO |
| Prepare Screenshots | 20 min | ⏳ TODO |
| Upload Build | 10 min | ⏳ TODO |
| Submit for Review | 5 min | ⏳ TODO |
| Google Review | 2-4 hrs | ⏳ TODO |
| **Total to Production** | **~4-5 hours** | ⏳ TODO |

---

## Next Actions

1. **Create Google Play Developer Account** ($25 fee)
2. **Set up Service Account** and download JSON key
3. **Fix EAS builds** or **build locally** for AAB
4. **Follow sections 4-6** to complete submission
5. **Monitor for approval** and go live!

---

## References

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Listing Requirements](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Content Rating Guidelines](https://support.google.com/googleplay/answer/188189)
- [Expo EAS Submit Documentation](https://docs.expo.dev/submit/android/)
