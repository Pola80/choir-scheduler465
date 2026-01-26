# 🚀 Step 3.4: Google Play Store Submission - Quick Start Guide

## Summary
Complete Google Play Store submission in 5 simple steps. Total time: ~4-5 hours including Google review.

---

## Step 1: Create Google Play Developer Account (15 min)

### 1.1 Visit Google Play Console
- Go to: https://play.google.com/console
- Sign in with your Google account

### 1.2 Create Developer Account
1. Accept terms and conditions
2. Pay **$25 one-time fee** (credit card required)
3. Complete your developer profile:
   - Full name
   - Email address
   - Phone number
   - Address
4. Submit for verification (instant)

✅ **Result**: Developer account ready

---

## Step 2: Set Up Service Account (10 min)

### 2.1 Create Service Account in GCP
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Select project: **choir-scheduler-deploy**
3. Click **Create Service Account**
4. Fill in:
   - Service account name: `google-play-submission`
   - Description: "For Google Play Store submissions"
5. Click **Create and Continue**

### 2.2 Grant Permissions
1. Grant role: **Owner** (full access for testing)
   - Click **Select a role** → Search "Owner"
   - Select it
2. Click **Continue**
3. Click **Done**

### 2.3 Download JSON Key
1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON**
5. Click **Create**
6. File will download automatically
7. **Move file to project root**:
   ```bash
   mv ~/Downloads/choir-scheduler-***-***-***.json ~/Projects/choir-scheduler/google-play-key.json
   ```
8. Add to `.gitignore` (if not already there):
   ```bash
   echo "google-play-key.json" >> ~/.gitignore
   ```

✅ **Result**: Service account configured and key saved

---

## Step 3: Build App (AAB File) - Choose One Option

### Option A: Build Locally (Recommended - Always Works)
```bash
cd "/Users/piusolaniyan/Library/CloudStorage/GoogleDrive-polalinux@gmail.com/My Drive/choir-scheduler"

# Build for production (takes 15-20 minutes)
eas build --platform android --profile production --local

# Output: choir-scheduler-1.0.0.aab (in project root)
```

⏳ **Time**: 15-20 minutes
✅ **Result**: `choir-scheduler-1.0.0.aab` ready for submission

### Option B: Use EAS Build (if available)
```bash
cd "/Users/piusolaniyan/Library/CloudStorage/GoogleDrive-polalinux@gmail.com/My Drive/choir-scheduler"

# Submit cloud build
eas build --platform android --profile production --no-wait

# Monitor at: https://expo.dev/accounts/polabass/projects/choir-scheduler

# Once complete, download:
eas build:download --build-id <BUILD_ID> --path ./choir-scheduler.aab
```

---

## Step 4: Create App in Google Play Console (30 min)

### 4.1 Create New App
1. Open: https://play.google.com/console
2. Click **Create app**
3. Enter:
   - **App name**: `Choir Scheduler`
   - **Default language**: English (US)
   - **App or game**: App
   - **Paid or free**: Free
   - **Declarations**: Check all that apply

### 4.2 Complete Store Listing
Navigate to: **Store presence → Store listing**

**Basic Info**:
- Title: `Choir Scheduler` (50 chars)
- Short description: `Manage rehearsals and member availability` (80 chars)
- Full description:
  ```
  Choir Scheduler makes it easy to organize choir rehearsals and manage member availability.

  Key Features:
  • Create and schedule rehearsals
  • Track member attendance
  • View rehearsal details and locations
  • Real-time synchronization
  • Simple, intuitive interface

  Perfect for choir directors, music teachers, and rehearsal coordinators.

  Manage your choir efficiently with Choir Scheduler!
  ```

**Category**: Select `Productivity`

### 4.3 Add Store Graphics

**Minimum Required**:
1. **App Icon**: `./assets/icon.png` (512×512 px)
   - Already have this ✅

2. **Screenshots** (2-8 needed):
   - Create 2-3 screenshots from the app showing:
     - Home screen (list of rehearsals)
     - Create rehearsal screen
     - Rehearsal details screen
   - Format: PNG or JPEG
   - Dimensions: 1080×1920 px (portrait)
   - **To capture screenshots**:
     ```bash
     # Run app in Expo Go on Android phone/emulator
     npm start
     # Scan QR code with Expo Go
     # Take screenshots with device camera button
     ```

3. **Feature Graphic** (optional but recommended):
   - Size: 1024×500 px
   - Can create with Canva or similar tool
   - Should showcase app's main features

### 4.4 Content Rating
1. Navigate to: **App content → Content rating**
2. Click **Set up questionnaire**
3. Select category: **Productivity** (should match earlier)
4. Answer all questions (likely all "No" for this app)
5. Click **Save questionnaire**
6. Rating will be auto-generated

### 4.5 Privacy Policy
1. Navigate to: **App content → Policies**
2. Add privacy policy URL
   - **Option A**: Host your own
   - **Option B**: Use Google's template:
     - Create Google Doc at: https://docs.google.com/document/templates
     - Use "Privacy Policy" template
     - Customize for your app
     - Share as public link
     - Add link to Play Store

### 4.6 Other Required Info
- **Target audience**: "Not intended for children"
- **Contact info**: Add support email address

✅ **Result**: App listing complete

---

## Step 5: Upload Build & Submit (15 min)

### 5.1 Upload AAB File
1. In Google Play Console, navigate to: **Release → Production**
2. Click **Create new release**
3. Click **Browse files**
4. Select your `.aab` file: `choir-scheduler-1.0.0.aab`
5. Wait for automated scanning (5-10 minutes)
6. Verify no errors appear

### 5.2 Add Release Notes (Optional)
```
Version 1.0.0 - Initial Release

Choir Scheduler v1.0.0 includes:
• Rehearsal creation and management
• Real-time member availability tracking
• Schedule synchronization across devices
• Attendance management
```

### 5.3 Submit for Review
1. Click **Review release**
2. Verify all info is correct:
   - App icon visible
   - Screenshots show correctly
   - Title and description appear
   - Release notes visible
3. Click **Start rollout to Production**

**What happens next**:
- Google Play team reviews your app
- Automated checks run
- Takes 2-4 hours typically (often same day)
- You'll receive email notification
- App appears on Play Store

✅ **Result**: Submitted! Waiting for approval.

---

## Monitoring After Submission

### Track Status
- **Google Play Console**: Release → Production (shows "Pending review" or "Live")
- **Email**: Google sends approval/rejection email to your developer account

### If Approved ✅
- App is **live** on Google Play Store
- Available for download worldwide
- Appears in search results and category listings
- **Share link**: https://play.google.com/store/apps/details?id=com.choirscheduler.app

### If Rejected ⚠️
- Check email for rejection reason
- Fix the issue (usually crashes, policies, or permissions)
- Resubmit with new build

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Build upload failed" | Ensure AAB is valid: `eas build:list` to see requirements |
| "App icon required" | Verify `./assets/icon.png` exists and is 512×512px |
| "Screenshots not accepted" | Check dimensions: 1080×1920px exactly |
| "Privacy policy needed" | Use Google template or host your own |
| "Crashes on startup" | Test app thoroughly before submission |
| "Permission unjustified" | Remove unused permissions or justify in description |

---

## Complete Timeline

```
Step 1: Create Account              15 min   ⏳ TODO
Step 2: Service Account             10 min   ⏳ TODO
Step 3: Build AAB                  15-20 min ⏳ IN PROGRESS
Step 4: App Listing                30 min   ⏳ TODO
Step 5: Upload & Submit            15 min   ⏳ TODO
Google Review                       2-4 hrs  ⏳ TODO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL TIME TO LIVE                 4-5 hrs
```

---

## Important Notes

1. **AAB File**: Ensure you have `choir-scheduler-1.0.0.aab` before step 4.5
2. **Screenshots**: Take at least 2-3 showing key features
3. **Privacy Policy**: Required - don't skip this
4. **Testing**: Test app one more time before submission
5. **Credentials**: Keep `google-play-key.json` safe, never commit to git

---

## Next Steps

1. ⏳ **Complete Step 1** (Google Play Account) - Takes 15 minutes
2. ⏳ **Complete Step 2** (Service Account) - Takes 10 minutes  
3. ⏳ **Complete Step 3** (Build AAB) - In progress or takes 15-20 minutes
4. ⏳ **Complete Step 4** (App Listing) - Takes 30 minutes
5. ⏳ **Complete Step 5** (Submit) - Takes 15 minutes

**Start with Step 1 now!** → https://play.google.com/console

Good luck! 🚀

---

## References
- [Google Play Console](https://play.google.com/console)
- [App Store Listing Requirements](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Expo EAS Submit](https://docs.expo.dev/submit/android/)
