/**
 * ─────────────────────────────────────────────────────────────────────────
 *  CareCircle API CONTRACT — the hand-off point between UI and backend.
 * ─────────────────────────────────────────────────────────────────────────
 *  The UI only ever talks to an object that implements `CareCircleApi`.
 *  Today that object is `mockApi` (src/api/mockApi.ts), which returns demo
 *  data from the browser. Backend owners: build a real implementation of
 *  this interface (e.g. `httpApi.ts` calling your server) and switch the
 *  export in src/api/index.ts. No screen code should need to change.
 *
 *  Rules of the contract
 *  - Shapes here are the source of truth. If the backend needs a change,
 *    change it here first, then fix the UI and the mock together.
 *  - No raw document images leave the extraction step unless
 *    `keepPhoto === true` (the caregiver opted in). See README → HIPAA.
 */

export type PersonId = 'ana' | 'elena' | 'luca'

/* ── Documents & extraction ─────────────────────────────────────────── */

export type DocumentType =
  | 'pharmacy_handout'
  | 'prescription'
  | 'discharge_summary'
  | 'bill'
  | 'eob'
  | 'referral'
  | 'visit_summary'
  | 'insurance_card'
  | 'other'

export type DetailCategory = 'how_to_take' | 'warning_sign' | 'avoid' | 'dose' | 'refill' | 'prescriber' | 'side_effects' | 'storage' | 'cost' | 'next_step' | 'other'

export type DetailAction = 'add_to_notes' | 'add_reminder' | 'update_reminder'

export interface ExtractedDetail {
  id: string
  category: DetailCategory
  /** Short chip label, e.g. "How to take". */
  label: string
  /** Plain-language sentence shown to the caregiver (editable by them). */
  text: string
  /** Page of the source document this came from (1-based). */
  sourcePage: number
  /** Buttons to offer on this detail, in order. */
  actions: DetailAction[]
  /** Short "pinned rule" versions saved to the medication when kept. */
  pinAs?: string[]
  /** If `update_reminder` is offered: which reminder it changes and the new note. */
  reminderUpdate?: { reminderId: string; newNote: string }
  /** If `add_reminder` is offered: the reminder to create. */
  reminderDraft?: { time: string; title: string; note: string }
  /** Critical details are shown as cards; the rest go under "More from this document". */
  critical: boolean
}

export interface ExtractRequest {
  personId: PersonId
  /** A real photo from the camera or photo library. */
  file?: Blob
  /** Or the id of a bundled sample document (see /public/sample). */
  sampleId?: string
  /** Privacy B default is false: delete the image right after extraction. */
  keepPhoto: boolean
}

export interface ExtractionResult {
  documentId: string
  personId: PersonId
  documentType: DocumentType
  /** Chip text, e.g. "Pharmacy handout". */
  typeLabel: string
  title: string
  pageCount: number
  /** Medication this document is about, if any (links details to the med card). */
  medicationId?: string
  details: ExtractedDetail[]
  /** True if the image was deleted after reading. */
  photoDeleted: boolean
  /** 'mock' until the real extraction backend is connected. */
  source: 'mock' | 'ai'
}

export interface SaveReviewRequest {
  documentId: string
  personId: PersonId
  /** Detail ids the caregiver chose to keep (added to notes / reminders). */
  keptDetailIds: string[]
  /** Text the caregiver edited before keeping, keyed by detail id. */
  edits: Record<string, string>
}

/* ── Reminders ──────────────────────────────────────────────────────── */

export type ReminderStatus = 'due' | 'late' | 'done'

export interface ReminderUpdate {
  reminderId: string
  note?: string
  escalateToLuca?: boolean
  enabled?: boolean
}

/* ── Settings ───────────────────────────────────────────────────────── */

export interface PrivacySettings {
  /** Has the caregiver gone through the privacy screen (Experiment 2, variant B)? */
  configured: boolean
  /** Who in the circle can see a person's documents. Ana (owner) always can. */
  sharedWithLuca: boolean
  sharedWithFutureInvitees: boolean
  /** Opt-in. Default false = delete the photo right after details are read. */
  keepPhoto: boolean
}

export interface NotificationPrefs {
  push: boolean
  text: boolean
  email: boolean
  inApp: boolean
  phone?: string
  emailAddress?: string
}

export type ReminderChannel = 'push' | 'text' | 'email' | 'inApp'

/* ── Experiment events (Experiments 2 & 3 — behavioral data) ────────── */

export type EventName =
  | 'privacy_viewed'
  | 'privacy_saved'
  | 'upload_choice' // props: { choice: 'real' | 'sample' }
  | 'document_captured' // props: { real: boolean, keepPhoto: boolean }
  | 'detail_kept'
  | 'detail_edited'
  | 'reminder_updated'
  | 'reminder_marked_done'
  | 'app_opened'

export interface AppEvent {
  name: EventName
  at: string // ISO timestamp
  props?: Record<string, string | number | boolean>
}

/* ── The interface ──────────────────────────────────────────────────── */

export interface CareCircleApi {
  extractDocument(req: ExtractRequest): Promise<ExtractionResult>
  saveReview(req: SaveReviewRequest): Promise<{ documentId: string }>
  updateReminder(req: ReminderUpdate): Promise<void>
  setReminderStatus(reminderId: string, status: ReminderStatus): Promise<void>
  savePrivacySettings(settings: PrivacySettings): Promise<void>
  saveNotificationPrefs(prefs: NotificationPrefs): Promise<void>
  /** Send a test reminder on the chosen channels; returns which ones went out. */
  sendTestReminder(channels: ReminderChannel[]): Promise<{ sent: ReminderChannel[]; notes: string[] }>
  logEvent(event: AppEvent): Promise<void>
}
