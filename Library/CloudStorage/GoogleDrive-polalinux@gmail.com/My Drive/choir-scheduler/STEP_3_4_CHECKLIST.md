# Step 3.4 Pre-Submission Checklist

## ✅ Infrastructure Ready
- [x] Backend deployed to Cloud Run (https://choir-backend-925038690128.us-central1.run.app)
- [x] PostgreSQL database configured and deployed
- [x] API endpoints tested and working
- [x] Frontend app code complete and tested
- [x] App configured for production (app.json)
- [x] Package dependencies stable (0 vulnerabilities)

## 📱 App Configuration
- [x] App name: "Choir Scheduler"
- [x] Package name: "com.choirscheduler.app"
- [x] Bundle ID: "com.choirscheduler.app"
- [x] Version: 1.0.0
- [x] Icon: ./assets/icon.png (512×512px required)
- [x] Splash screen: ./assets/splash.png
- [x] Orientation: Portrait

## 🏗️ Build Configuration
- [x] EAS project ID configured
- [x] Android keystore configured
- [x] Production build profile ready
- [x] No deprecated fields in app.json
- [x] All peer dependencies installed

## 📋 Required Documents (Before Submission)
- [ ] Privacy Policy URL (can use Google's template)
- [ ] Support email address
- [ ] Screenshots (2-8 per device type)
  - [ ] Phone: 1080×1920 px (portrait)
  - [ ] 7-inch tablet: 1200×1920 px (portrait)
  - [ ] Showing: Home, Create Rehearsal, Details screens
- [ ] Feature Graphic: 1024×500 px (landscape)
- [ ] App Icon verified: 512×512 px

## 🔐 Google Play Account (To Complete Before Step 3.4)
- [ ] Google Play Developer Account created ($25)
- [ ] Developer profile completed:
  - [ ] Name and email
  - [ ] Phone number
  - [ ] Address
- [ ] Service Account created
- [ ] Service Account JSON key downloaded
- [ ] Service Account granted "Owner" role

## 📦 Build Artifact
**Option A: EAS Build** (faster if working)
- [ ] Debug and fix build failures, OR
- [ ] Use previously completed APK/AAB

**Option B: Local Build** (always works)
```bash
cd ~/Projects/choir-scheduler
eas build --platform android --profile production --local
# Produces: choir-scheduler-1.0.0.aab (~15-20 min)
```

## 🎯 Google Play Store Setup
- [ ] Google Play Console account created
- [ ] App created in console
- [ ] App listing info entered:
  - [ ] Title (50 chars max)
  - [ ] Short description (80 chars max)
  - [ ] Full description (4000 chars max)
  - [ ] Screenshots uploaded
  - [ ] Feature graphic uploaded
  - [ ] Category selected (Productivity)
- [ ] Content rating completed
- [ ] Target audience configured
- [ ] Privacy policy URL added
- [ ] Support email added

## 🚀 Submission Steps
1. [ ] Upload AAB file to Play Store
2. [ ] Wait for automated scanning (~5-10 min)
3. [ ] Add release notes (optional)
4. [ ] Submit for review
5. [ ] Monitor approval status (2-4 hours typical)
6. [ ] Go live on Play Store

## 🔒 Post-Launch
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track install metrics
- [ ] Plan version 1.1 features based on feedback

---

## Execution Plan

### Today: Prepare Assets
1. Create/finalize screenshots
2. Create Google Play account ($25)
3. Create service account and download JSON
4. Prepare privacy policy

### Tomorrow: Build & Submit
1. Build AAB (either via EAS or local)
2. Create app listing in Play Store
3. Upload AAB and complete metadata
4. Submit for review
5. Monitor approval

### Result
- App live on Google Play Store within 4-8 hours
- Available for download worldwide
- Ready for marketing/promotion

---

## Current Status

| Item | Status | Action Required |
|------|--------|-----------------|
| Backend | ✅ Deployed | None |
| Database | ✅ Ready | None |
| Frontend App | ✅ Complete | None |
| Build Configuration | ✅ Ready | None |
| Screenshots | ⏳ Pending | Create (2-3 shots) |
| Privacy Policy | ⏳ Pending | Use Google template |
| Google Play Account | ⏳ Pending | Create + $25 |
| Service Account | ⏳ Pending | Set up in GCP |
| Build Artifact (AAB) | ⏳ Pending | Build locally or fix EAS |
| App Store Listing | ⏳ Pending | Fill in Play Console |
| Submission | ⏳ Pending | Submit for review |

---

## Notes

- **EAS Build Status**: Recent builds failing. Recommending local build for reliability.
- **Build Time**: Local build takes 15-20 minutes first time
- **Google Play Review**: Typically 2-4 hours, sometimes same day
- **App Icon**: Already in `assets/icon.png` - will be used automatically
- **Database**: PostgreSQL fully deployed and tested
- **Backend API**: Production-ready at GCP URL

---

## Support

For issues during submission:
- Google Play Support: https://support.google.com/googleplay/android-developer
- EAS Docs: https://docs.expo.dev/submit/android/
- Expo Forum: https://forums.expo.dev/

Good luck with launch! 🚀
