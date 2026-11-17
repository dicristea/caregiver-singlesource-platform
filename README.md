# CareCircle: caregiver single-source platform

**TECH 5900 Product Studio · Cornell Tech · Fall 2026**

### One place for everyone you care for.
CareCircle is the one source of truth for people navigating care for the people they love: a one-stop shop for the prescriptions, bills, appointments and follow-ups that pile up after every visit. Snap a document, check what it read, and the reminders and next steps are set up for you. Less time on paperwork, more time together.

The UI is built and deployed on synthetic data. Backend work is open and tracked in the [Product roadmap](#product-roadmap) and [Backend hand-off](#backend-hand-off).

- **Live app:** `https://carecircle-caregiverplatform.vercel.app` (see [Deploy](#deploy-free-on-vercel))
- **Design source:** [CareCircle Figma](https://www.figma.com/design/UNy0iGfSEzyws5eKAVXxOD/CareCircle--iPhone-Mockup).
- **Demo story:** Ana (the caregiver), her mother Elena and her son Luca. All data is synthetic.

---

## Product roadmap

✅ Built · 🟡 Work in progress: needs backend work · ⛔ Out of scope for Demo Day

| Status | Work | Owner | Notes |
|---|---|---|---|
| ✅ | **Scan → review → reminder UI**: Add sheet, scanner (live camera, photo library, sample handout), review and edit details, update-reminder sheet, notification preview | Diana | Runs end to end on the mock API |
| ✅ | **Privacy controls UI** (Experiment 2, variant B): shown before the first scan and in Settings → Privacy | Diana | Who can see documents · keep only the details (default) or keep the photo too |
| ✅ | Navigate: costs & claims, open cases, cardiology referral case, hospital bill case | Diana | Demo data |
| ✅ | Today, Circle, Elena (Overview / Meds / Notes / Reminders), Documents, Settings, reminder channels | Diana | |
| ✅ | Sample pharmacy handout, 2 pages, watermarked | Diana | `public/sample/` |
| ✅ | Typed API contract and in-browser mock | Diana | `src/api/contract.ts` |
| 🟡 | **Real document extraction** (`extractDocument`): photo → structured details with page numbers | Backend Eng | Must delete the image after reading unless `keepPhoto` |
| 🟡 | **Reminder delivery**: push at the scheduled time (Web Push → `public/sw.js`), plus text and email | Backend Eng | Push is the default channel |
| 🟡 | **Persist data**: reviewed documents, reminders, privacy settings, notification preferences | Backend Eng | `saveReview`, `updateReminder`, `savePrivacySettings`, `saveNotificationPrefs` |
| 🟡 | **Enforce privacy server-side**: circle sharing and photo deletion | Backend Eng | See [HIPAA and privacy](#hipaa-and-privacy) |
| 🟡 | **Experiment event logging** (`logEvent`) stored server-side | Backend Eng | Ids and booleans only |
| ⛔ | Wearables (Apple Watch / Fitbit / Oura alerts) | — | Shown as demo content; tapping says "next on our roadmap" |
| ⛔ | Ask (AI navigator) | — | "Coming soon" screen |
| ⛔ | Language settings | — | Rows shown, not functional |

### The sample document

`public/sample/levothyroxine-handout.png` (page 1) and `levothyroxine-handout-p2.png` (page 2) are a **synthetic** pharmacy handout for Elena from a fictional pharmacy, watermarked *SAMPLE · FOR DEMONSTRATION ONLY*. "Try a sample document" scans it in the app. For a live demo, print page 1 and photograph it with "Scan Elena's document." Until real extraction is connected, the mock returns the same details for any photo and the review screen shows a "Demo mode" note.

---

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173 (desktop shows the app inside an iPhone frame)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

On a phone, open the URL in Safari → **Share → Add to Home Screen**. The app then runs full screen and can show notifications (iOS 16.4+).

To reset the story: **Settings → Reset demo**.

## Deploy free on Vercel

Vercel's Hobby plan is free for non-commercial projects, and every pull request gets its own preview URL.

1. [vercel.com/new](https://vercel.com/new) → **Import** `caregiver-singlesource-platform`.
2. **Project name:** `carecircle-caregiverplatform` → free URL `carecircle-caregiverplatform.vercel.app`.
3. Leave the other settings as they are: Vite is set by `vercel.json`, the root directory is `./`, and no environment variables are needed yet. Click **Deploy**.
4. Every push to `main` redeploys production. Every PR gets a preview URL.

`vercel.json` adds SPA routing (deep links like `/people/elena/meds` work) and a camera-only permissions policy.

---

## Stack and structure

**React + TypeScript + Vite.** No CSS framework: design tokens are CSS variables copied from Figma (`src/styles/tokens.css`), and every UI element is a reusable React component. Icons come from `lucide-react`, routing from `react-router-dom`. UI conventions are in [CLAUDE.md](CLAUDE.md).

```
src/
  api/
    contract.ts        ← THE backend contract (types + CareCircleApi interface)
    mockApi.ts         ← in-browser mock the UI uses today
    index.ts           ← one line switches mock → real backend
  components/
    ui/primitives.tsx  ← Card, ListRow, Chip, Button, Toggle, Radio, Avatar, IconTile,
                          SegmentedControl, Progress, Banner, NumberedSteps, KeyValue, ScreenHeader
    layout/layout.tsx  ← Page, StatusBar, TabBar, NavBar, BottomSheet, toast + push preview
    domain/            ← PersonCard, PersonHeader, ReminderRow, MedCard, CaseCard, DocRow,
                          AlertCard, OptionCard, SettingsGroup, PrivacyControls
  screens/             ← one file per screen (scan flow in screens/scan/)
  state/AppStore.tsx   ← app state (React context), persisted to localStorage for the demo
  data/demo.ts         ← Ana / Elena / Luca demo profiles (copied from Figma)
  lib/notify.ts        ← on-device notifications
public/
  sample/              ← sample pharmacy handout (2 pages)
  sw.js                ← service worker (notifications; the real Web Push handler goes here)
  manifest.webmanifest ← Add to Home Screen
```

---

## Backend hand-off

> **The backend stack is Backend Eng's call.** Nothing below is decided. These are notes on what the UI needs, plus free options to consider.

### The contract

The UI talks to exactly one object that implements `CareCircleApi` in **`src/api/contract.ts`**. Today that object is `mockApi`. To connect a real backend:

1. Write `src/api/httpApi.ts` implementing `CareCircleApi` (e.g. `fetch` calls to your server).
2. In `src/api/index.ts`, export it instead of `mockApi`.
3. Screens don't change. If the backend needs a different shape, change `contract.ts` first, then the mock and the UI together.

| Method | Used by | What it must do |
|---|---|---|
| `extractDocument` | Scanner | Photo (or sample id) → `ExtractionResult` with critical details, page numbers and suggested actions. **Delete the image after reading unless `keepPhoto` is true.** |
| `saveReview` | Review → Done | Persist the details the caregiver kept, and their edits |
| `updateReminder` / `setReminderStatus` | Update-reminder sheet, Today checkmarks, Elena → Reminders toggles | Persist reminder changes; schedule delivery |
| `savePrivacySettings` | Privacy controls (first scan + Settings) | Persist who can see documents and the keep-photo choice |
| `saveNotificationPrefs` / `sendTestReminder` | Settings → How reminders reach you | Store channels; send a test on push / text / email |
| `logEvent` | Throughout | Store experiment events (below) |

### Priorities, in order

1. **Real extraction** for the sample handout and a real photo of it (`extractDocument`).
2. **A reminder that actually fires** at its time as a push notification (Web Push from a server → `public/sw.js` `push` handler).
3. **Event logging** for the experiment readout.

### Free options to evaluate (no credits)

| Need | Free option | Watch out for |
|---|---|---|
| API / server | Vercel Functions in an `api/` folder of this repo (same deploy, same free plan) | 10 s default timeout on Hobby |
| Database, auth, file storage | Supabase free tier | Projects pause after ~1 week of inactivity |
| Document extraction | **Tesseract.js OCR in the browser** + rules for the known handout layout (free; the image never leaves the phone) | Less flexible than an LLM |
| | Free tiers of hosted vision LLMs | **Some free tiers use your data to improve their models.** That breaks the "Never used to train AI" promise on the privacy screen. Read the terms first. |
| Push notifications | Web Push with VAPID keys (`web-push` npm package) | iPhone: only after Add to Home Screen |
| Text messages | Twilio trial | Can only text verified numbers |
| Email | Resend free tier | Daily send limit |

### Experiment events

`privacy_viewed`, `privacy_saved`, `upload_choice` (`real` / `sample`), `document_captured` (`real`, `keepPhoto`), `detail_kept`, `detail_edited`, `reminder_updated`, `reminder_marked_done`, `app_opened`. Events carry **ids and booleans only, never document text**. The mock stores them in `localStorage` (`cc-events-v1`).

---

## HIPAA and privacy

**This app is NOT HIPAA compliant, and it must not hold real patient information.** We won't test with real users, but the rules below still apply.

- **Synthetic data only** (Ana, Elena, Luca; the sample handout is watermarked).
- Free tiers (Vercel Hobby, Supabase free, free AI tiers, Twilio trial) **do not sign a BAA** (Business Associate Agreement), which HIPAA requires of any vendor that stores or processes protected health information (PHI). Don't photograph real medical documents into a deployed build.
- The UI follows the privacy promises tested in Experiment 2. The backend must keep them true:
  - **Delete the photo right after extraction** unless the caregiver chose "Keep the photo too" (default off).
  - **Never send document content to analytics or logs.** Events are ids and booleans.
  - **Never use document content to train or improve any model.** Pick vendors and tiers whose terms guarantee this.
  - Only people the caregiver allowed (Settings → Privacy) can see a person's documents.
  - Encrypt in transit (HTTPS, which Vercel provides) and at rest.
- If CareCircle ever handled real users: move to vendors that sign BAAs, add access logging, keep only the minimum necessary data, set up a breach process, and comply with the FTC Health Breach Notification Rule.
