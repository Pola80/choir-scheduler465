#!/bin/bash
# Step 3.4 Automation Script - Google Play Submission

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Choir Scheduler - Google Play Submission ===${NC}\n"

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    echo -e "${YELLOW}⚠️  Not in project root. Please run from ~/Projects/choir-scheduler${NC}"
    exit 1
fi

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking Prerequisites...${NC}"

if [ ! -f "app.json" ]; then
    echo "❌ app.json not found"
    exit 1
fi
echo "✅ app.json found"

if [ ! -d "assets" ]; then
    echo "❌ assets directory not found"
    exit 1
fi
echo "✅ assets directory found"

if [ ! -f "assets/icon.png" ]; then
    echo "⚠️  icon.png not found in assets"
    echo "   Recommendation: Add 512x512px icon to assets/icon.png"
fi

# Step 2: Check for AAB file
echo -e "\n${BLUE}Step 2: Looking for Build Artifact...${NC}"

AAB_FILE=$(ls -t choir-scheduler-*.aab 2>/dev/null | head -1)

if [ -n "$AAB_FILE" ]; then
    echo "✅ Found AAB file: $AAB_FILE"
    echo "   Size: $(du -h "$AAB_FILE" | cut -f1)"
    echo "   Built: $(stat -f %Sm -t '%Y-%m-%d %H:%M:%S' "$AAB_FILE")"
else
    echo -e "${YELLOW}⚠️  No AAB file found${NC}"
    echo "   Building locally (this takes 15-20 minutes)..."
    echo ""
    echo "   Run this command:"
    echo "   $ eas build --platform android --profile production --local"
    echo ""
    echo "   After build completes, run this script again."
    exit 0
fi

# Step 3: Check Google Play credentials
echo -e "\n${BLUE}Step 3: Checking Credentials...${NC}"

if [ ! -f "google-play-key.json" ]; then
    echo -e "${YELLOW}⚠️  google-play-key.json not found${NC}"
    echo ""
    echo "   Follow these steps to create it:"
    echo "   1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
    echo "   2. Create service account: 'google-play-submission'"
    echo "   3. Grant 'Owner' role"
    echo "   4. Create JSON key"
    echo "   5. Save as: google-play-key.json"
    echo ""
    exit 0
else
    echo "✅ google-play-key.json found"
fi

# Step 4: Validate app.json
echo -e "\n${BLUE}Step 4: Validating Configuration...${NC}"

VERSION=$(grep -o '"version": "[^"]*"' app.json | cut -d'"' -f4)
PACKAGE=$(grep -o '"package": "[^"]*"' app.json | cut -d'"' -f4)

echo "   App Version: $VERSION"
echo "   Package Name: $PACKAGE"

if [ -z "$VERSION" ] || [ -z "$PACKAGE" ]; then
    echo "❌ Invalid app.json configuration"
    exit 1
fi

echo "✅ Configuration valid"

# Step 5: Ready for submission
echo -e "\n${GREEN}=== Ready for Submission ===${NC}"
echo ""
echo "Your app is ready to submit to Google Play Store!"
echo ""
echo "Next steps:"
echo "1. Go to: https://play.google.com/console"
echo "2. Create new app 'Choir Scheduler'"
echo "3. Fill in app listing details"
echo "4. Upload AAB file: $AAB_FILE"
echo "5. Submit for review"
echo ""
echo "Expected submission time: 2-4 hours"
echo "Expected approval: Same day (typically)"
echo ""

# Summary
echo -e "${BLUE}Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "App:           Choir Scheduler"
echo "Version:       $VERSION"
echo "Package:       $PACKAGE"
echo "Build File:    $AAB_FILE"
echo "Build Size:    $(du -h "$AAB_FILE" | cut -f1)"
echo "Backend URL:   https://choir-backend-925038690128.us-central1.run.app"
echo "Database:      PostgreSQL (choir-db)"
echo "Status:        ✅ Ready for Production"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Good luck with your app launch!"
