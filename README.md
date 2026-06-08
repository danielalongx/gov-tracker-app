# Signal — Investment Signal Platform (Phase 1)

Front-end app for the gov-tracker investment signal system. Phase 2 will wire up the gov-tracker SQLite database and API at `/Users/longx/Documents/gov-tracker`.

---

## Requirements

- Node 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- iOS Simulator (Xcode) **or** Android Emulator (Android Studio)
- Expo Go app on a physical device (optional)

---

## Install

```bash
cd gov-tracker-app
npm install
```

---

## Run

### iOS Simulator

```bash
npx expo start --ios
```

Xcode must be installed. The simulator opens automatically.

### Android Emulator

```bash
npx expo start --android
```

An AVD must be running in Android Studio before invoking this command.

### Expo Go (physical device)

```bash
npx expo start
```

Scan the QR code in the terminal with the Expo Go app (iOS: Camera app, Android: Expo Go app).

---

## Project structure

```
src/
├── theme/          Design tokens — colors, spacing, radius, shadow
├── types/          TypeScript interfaces (Signal, UserPreferences)
├── data/
│   └── mockSignals.ts   8 mock signals (replace with API in Phase 2)
├── utils/
│   ├── storage.ts  AsyncStorage helpers for user preferences
│   └── time.ts     Relative time formatter (中文)
├── navigation/
│   └── MainNavigator.tsx  Bottom-tab nav (Feed + Settings)
├── screens/
│   ├── OnboardingScreen.tsx  5-step first-run flow
│   ├── FeedScreen.tsx        Signal feed with pull-to-refresh
│   └── SettingsScreen.tsx    Preference editor
└── components/
    ├── SignalCard.tsx         Feed card UI
    ├── ProgressIndicator.tsx  Step dots for onboarding
    ├── ChipSelect.tsx         Multi-select chip row
    ├── LabeledSlider.tsx      Slider with labelled tick marks
    └── steps/                 Reusable onboarding step views
        ├── ExperienceStep.tsx
        ├── RiskStep.tsx
        ├── RegionsStep.tsx
        ├── SectorsStep.tsx
        └── NotificationsStep.tsx
```

---

## Phase 2 integration notes

The gov-tracker backend lives at `/Users/longx/Documents/gov-tracker`. To integrate:

1. Expose an HTTP endpoint (e.g. `GET /api/signals`) from gov-tracker
2. Replace `MOCK_SIGNALS` usage in `FeedScreen.tsx` with a `fetch()` call
3. Store the base URL in `src/config.ts` and point to `localhost` for simulator
   (use your machine's LAN IP for physical devices)

The `UserPreferences` type and all AsyncStorage logic are already in place — no changes needed on the preference side.

### Notification schedule (Phase 2)

The user's chosen push times (08:00 / 12:00 / 20:00) are persisted to AsyncStorage during onboarding.
`src/notifications/scheduler.ts` exposes `getScheduledTimes()` to read them.

To wire up Phase 2:
1. On app launch (after preferences are loaded), call `getScheduledTimes()` and `POST /api/preferences` with `{ notification_times: [...] }` to register the schedule on the backend.
2. The gov-tracker backend can then schedule its signal digest pipeline to run at those hours and push results to the device (via APNs/FCM or by exposing a time-filtered endpoint).
3. Alternatively, use `expo-notifications` to schedule local notifications at those times that trigger a background fetch against `GET /signals`.

---

## Design system

| Token | Value |
|-------|-------|
| background | `#F7F2E8` champagne white |
| surface | `#FDFAF4` card fill |
| border | `#E8E0D0` warm grey |
| accent-blue | `#2563EB` selection / CTA |
| accent-gold | `#C9A84C` decorative |
| bullish | `#16A34A` |
| bearish | `#DC2626` |
| neutral | `#6B7280` |

All tokens live in `src/theme/index.ts`.

---

## App icon

The default Expo icon placeholder is in `assets/icon.png`. The Android adaptive icon background
has been set to `#F7F2E8` (champagne) in `app.json`.

To ship a real icon:

1. Create a **1024 × 1024 PNG** (`assets/icon.png`) with:
   - Background fill: `#F7F2E8`
   - Centered thin upward-arrow or candlestick graphic in `#2563EB`
   - Minimal weight — 1–2 px strokes scale well at small sizes
2. Export a separate foreground-only version for the Android adaptive icon
   (`assets/android-icon-foreground.png`) — transparent background, graphic only
3. Run `npx expo prebuild` to regenerate native icon assets after replacing the files

> Replace `app.json`'s `icon` field and the `adaptiveIcon` fields before publishing.
