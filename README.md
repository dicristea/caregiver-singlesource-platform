# CareCircle: caregiver single-source platform

**Team 312 · TECH 5900 Product Studio · Cornell Tech · Fall 2026**
Diana Cristea (UI and design) · Yu-Jye "UJ" Hu and Zoe Krishtul (backend)

> **Snap it once. CareCircle reads it, the caregiver approves every detail, and the work is set up.**
> For working adults managing a parent's care (Medicare Advantage, first week after a discharge or specialist referral).

This repo is the **working product for Demo Day (Maker Day 4, Dec 4)**. The UI is built and deployed. The backend is open for UJ and Zoe (see [Backend hand-off](#backend-hand-off)).

- **Live demo:** `https://carecircle-caregiverplatform.vercel.app` (see [Deploy](#deploy-free-on-vercel))
- **Design source:** [CareCircle Figma](https://www.figma.com/design/UNy0iGfSEzyws5eKAVXxOD/CareCircle--iPhone-Mockup). The UI matches it screen for screen.
- **Demo story:** Ana (the caregiver), her mother Elena and her son Luca. All data is fictional.

---

## What's built (ranked by what matters to the user)

| Priority | Flow | Screens | Status |
|---|---|---|---|
| **P0** | **One scan does the work**: scan → check what it read → reminder set | Add sheet → Scanner → Review details (edit, keep) → Update reminder → push preview → Elena's meds | ✅ UI complete, mock backend |
| **P0** | **Privacy controls (Experiment 2, variant B)**: shown before the first scan | Who can see documents (toggles) · keep only the details (default) or keep the photo too · "Always on" promises | ✅ UI complete, also in Settings → Privacy |
| P1 | **Costs, claims and cases** | Navigate: Costs & claims, Open cases, case detail (cardiology referral), bill case (Riverside Hospital) | ✅ UI complete, demo data |
| P1 | Supporting screens | Today, Circle, Elena (Overview / Meds / Notes / Reminders), Documents, Settings, reminder channels | ✅ |
| Not built | Wearables (Flow 3) | BP alert shown as demo content only; tapping it says "next on our roadmap" | ⏭ What's next |
| Not built | Ask (AI navigator) | "Coming soon" screen | ⏭ What's next |
| Not built | Language settings | Rows shown, not functional | ⏭ Out of scope |

### The sample document

`public/sample/levothyroxine-handout.png` (page 1) and `levothyroxine-handout-p2.png` (page 2) are a **fictional** pharmacy handout for Elena, watermarked *SAMPLE · FOR DEMONSTRATION ONLY*. The "Try a sample document" option scans it in-app. For a live demo, print page 1 and photograph it with "Scan Elena's document." The mock backend returns the same details for any photo until real extraction is connected.

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

Vercel's Hobby plan is free for non-commercial projects, and every pull request gets its own preview URL, so UJ and Zoe can review backend work on a live link.

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** `dicristea/caregiver-singlesource-platform`.
2. **Project name:** `carecircle-caregiverplatform`. This becomes the free URL `carecircle-caregiverplatform.vercel.app`. Vercel URLs can't contain dots; if the name is taken, try `carecircle-team312`.
3. Framework preset: **Vite** (auto-detected; `vercel.json` sets the rest). Click **Deploy**.
4. Every push to `main` redeploys production. Every PR gets a preview URL.

`vercel.json` adds SPA routing (deep links like `/people/elena/meds` work) and a camera-only permissions policy.

---

## Stack and structure

**React + TypeScript + Vite.** No CSS framework: design tokens are CSS variables copied from Figma (`src/styles/tokens.css`), and **every UI element is a reusable React component**. Icons come from `lucide-react`, routing from `react-router-dom`.

```
src/
  api/
    contract.ts        ← THE backend contract (types + CareCircleApi interface)
    mockApi.ts         ← in-browser mock that the UI uses today
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
  sw.js                ← service worker (notifications; real Web Push handler goes here)
  manifest.webmanifest ← Add to Home Screen
```

**Adding UI:** build from the components above first. If something repeats twice, make it a component. Never hardcode a hex color; use the token variables.

---

## Backend hand-off

> **The backend is UJ's and Zoe's call.** Nothing below is decided. These are notes on what the UI needs, plus free options to consider.

### The contract

The UI talks to exactly one object that implements `CareCircleApi` in **`src/api/contract.ts`**. Today that object is `mockApi`. To connect a real backend:

1. Write `src/api/httpApi.ts` implementing `CareCircleApi` (e.g. `fetch` calls to your server).
2. In `src/api/index.ts`, export it instead of `mockApi`.
3. Screens don't change. If the backend needs a different shape, change `contract.ts` first, then the mock and the UI together.

| Method | Used by | What it must do |
|---|---|---|
| `extractDocument` | Scanner | Photo (or sample id) → `ExtractionResult` with critical details, page numbers, suggested actions. **Delete the image after reading unless `keepPhoto` is true.** |
| `saveReview` | Review → Done | Persist the details the caregiver kept (and their edits) |
| `updateReminder` / `setReminderStatus` | Update-reminder sheet, Today checkmarks, Elena → Reminders toggles | Persist reminder changes; schedule delivery |
| `savePrivacySettings` | Privacy controls (first scan + Settings) | Persist who can see documents and keep-photo choice |
| `saveNotificationPrefs` / `sendTestReminder` | Settings → How reminders reach you | Store channels; send a test on push / text / email |
| `logEvent` | Throughout | Store experiment events (below) |

### What the demo most needs, in order

1. **Real extraction** for the sample handout and a real photo of it (`extractDocument`). This is "the part we built and why it matters" in the Demo Day rubric.
2. **A reminder that actually fires** at its time as a push notification (Web Push from a server → `public/sw.js` `push` handler).
3. **Event logging** for the experiment readout.

### Free options to evaluate (no credits)

| Need | Free option | Watch out for |
|---|---|---|
| API / server | Vercel Functions in an `api/` folder of this repo (same deploy, same free plan) | 10 s default timeout on Hobby |
| Database, auth, file storage | Supabase free tier | Projects pause after ~1 week of inactivity; keep the demo project active |
| Document extraction | **Tesseract.js OCR in the browser** + rules for the known handout layout (free, image never leaves the phone) | Less flexible than an LLM |
| | Free tiers of hosted vision LLMs | **Some free tiers use your data to improve their models.** That breaks our "Never used to train AI" promise on the privacy screen. Read the terms first. |
| Push notifications | Web Push with VAPID keys (`web-push` npm package) | iPhone: only after Add to Home Screen |
| Text messages | Twilio trial | Can only text verified numbers (fine for a 3-person team) |
| Email | Resend free tier | Daily send limit |

### Experiment events (agreed for Experiments 2 and 3)

`privacy_viewed`, `privacy_saved`, `upload_choice` (`real` / `sample`), `document_captured` (`real`, `keepPhoto`), `detail_kept`, `detail_edited`, `reminder_updated`, `reminder_marked_done`, `app_opened`. Events carry **ids and booleans only, never document text**. The mock stores them in `localStorage` (`cc-events-v1`).

---

## HIPAA and privacy

**This app is NOT HIPAA compliant, and it must not hold real patient information.**

- It is a class demo with **fictional data only** (Ana, Elena, Luca; the sample handout is watermarked).
- Free tiers (Vercel Hobby, Supabase free, free AI tiers, Twilio trial) **do not sign a BAA** (Business Associate Agreement), which HIPAA requires of any vendor that stores or processes protected health information (PHI). Don't photograph real medical documents into a deployed build.
- The UI already follows the privacy promises we tested in Experiment 2. The backend must keep them true:
  - **Delete the photo right after extraction** unless the caregiver chose "Keep the photo too" (default off).
  - **Never send document content to analytics or logs.** Events are ids and booleans.
  - **Never use document content to train or improve any model.** Pick vendors and tiers whose terms guarantee this.
  - Only people the caregiver allowed (Settings → Privacy) can see a person's documents.
  - Encrypt in transit (HTTPS, which Vercel provides) and at rest.
- If CareCircle ever handled real users: move to vendors that sign BAAs, add access logging, minimum-necessary data, a breach process, and FTC Health Breach Notification Rule compliance.

---

## Roadmap: aligned to the Demo Day rubric, and nothing more

Demo Day (Maker Day 4) is **Dec 4**. Slides are due as one PDF by **5:00 p.m. Dec 4** (also Milestone 6). Demo Day counts double.

| Rubric criterion (Strong =) | Engineering requirement | Owner | By |
|---|---|---|---|
| **Product:** "A working product that matches the vision. The team built the part that matters and can say why it matters." *A mockup is not a build.* | Scan → review → reminder runs end to end on an iPhone with **real** extraction of the sample handout and a reminder that fires | UI ✅ Diana · backend UJ + Zoe | Nov 30 |
| | Deployed public URL, stable demo account (Reset demo) | Diana ✅ | Nov 16 |
| **Evidence:** "Results reported as behavior against thresholds set in advance. New results since Maker Day 3." | `logEvent` persisted server-side so Exp 2 (real vs. sample uploads) and Exp 3 (week-4 activity) are counted from behavior | UJ + Zoe | Nov 23 |
| **Demo:** "Live demo… if confident it will work. If undue risk, a recording." | Screen recording on iPhone of the P0 flow as backup | Team | Dec 3 |
| **What is next:** "What is not built…" | Keep the not-built list honest: wearables, Ask, language, real accounts | Team | Dec 3 |
| **Reflection / Execution** | No engineering work | Team | — |

Code freeze **Dec 2**. After that, only demo-breaking fixes.
