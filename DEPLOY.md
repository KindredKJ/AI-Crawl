# AI Crawl — Play Store Deployment Guide

## Prerequisites
- Android Studio installed (for emulator testing)
- JDK 17+
- Node.js 20+

---

## Step 1 — Generate a Keystore (one-time)

Run this once and store the file somewhere permanent and backed up.
**Do not commit the `.jks` file to git.**

```bash
keytool -genkey -v \
  -keystore aicrawl-release.jks \
  -alias aicrawl \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for passwords. Write them down — you can never change them once the app is on the Play Store.

---

## Step 2 — Add GitHub Secrets

In your repo: **Settings → Secrets and variables → Actions**, add:

| Secret Name        | Value                                      |
|--------------------|--------------------------------------------|
| `KEYSTORE_PATH`    | Path to the `.jks` file on the runner      |
| `KEYSTORE_PASSWORD`| Password you set in Step 1                 |
| `KEY_ALIAS`        | `aicrawl`                                  |
| `KEY_PASSWORD`     | Key password from Step 1                   |

For the keystore file itself, base64-encode it and add as a secret, then decode in the CI step:
```bash
base64 aicrawl-release.jks | pbcopy   # macOS — copies to clipboard
```
Add that as `KEYSTORE_BASE64`, then in CI:
```yaml
- name: Decode Keystore
  run: echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 --decode > android/app/keystore.jks
```

---

## Step 3 — Local Build (test before CI)

```bash
# Install deps
npm install

# Build web app → capacitor sync → open Android Studio
npm run cap:sync
npm run cap:open

# Or build APK directly from CLI
npm run android:build   # produces APK
npm run android:bundle  # produces AAB for Play Store
```

---

## Step 4 — Create Play Store Listing

1. Go to [play.google.com/console](https://play.google.com/console)
2. Create new app → **AI Crawl**
3. App category: **Games → Role Playing**
4. Fill in short description: *"Capture AI entities, forge legendary gear, conquer the Nexus."*
5. Upload screenshots (min 2, recommended 8) — take them from Android emulator
6. Set Content Rating: **Everyone 10+** (fantasy violence)
7. Upload the `.aab` file from `android/app/build/outputs/bundle/release/`

---

## Step 5 — Internal Testing Track (recommended first)

Upload to **Internal Testing** first — lets you install on your own device instantly without full review. Once it feels solid, promote to **Production**.

---

## App IDs
- **Android Package:** `com.neoapps.aicrawl`
- **Cloud Sync URL:** `https://kindred-492933f1.base44.app/functions/syncSave`
- **Min Android:** 6.0 (API 23)
- **Target Android:** 14 (API 34)

---

## Updating the App

Every new version needs:
1. Bump `versionCode` in `android/build.gradle` (increment by 1)
2. Bump `versionName` (semantic version string)
3. Push to main → CI builds and signs the AAB automatically
4. Upload new AAB to Play Console → roll out
