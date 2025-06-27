# TestFlight Deployment Guide

## Prerequisites
- Apple Developer Account ($99/year)
- TestFlight app installed on iPhone
- EAS CLI installed

## Steps

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS Build
```bash
eas build:configure
```

### 3. Create App in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "+" → "New App"
3. Select iOS platform
4. Fill in:
   - Name: SnapBet
   - Bundle ID: com.whitemitchell.snapbet
   - SKU: snapbet-001

### 4. Build for Production
```bash
eas build --platform ios --profile production
```
This will:
- Prompt for Apple credentials
- Create provisioning profiles
- Build the app (~20-30 mins)
- Auto-upload to App Store Connect

### 5. Configure TestFlight
1. In App Store Connect → Your App → TestFlight
2. Complete compliance questions
3. Add yourself as internal tester
4. Wait for "Ready to Test" email

### 6. Install on iPhone
1. Open TestFlight app
2. Accept invite
3. Install SnapBet
4. Launch app

## Build Profiles (eas.json)
```json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release",
        "distribution": "store"
      }
    }
  }
}
```

## Troubleshooting
- **"Missing Distribution Certificate"**: Let EAS create one
- **Build fails**: Check `eas build:list` for logs
- **Not seeing invite**: Check spam folder or App Store Connect

## Notes
- First build takes longest (provisioning setup)
- Subsequent builds are faster
- TestFlight builds expire after 90 days 