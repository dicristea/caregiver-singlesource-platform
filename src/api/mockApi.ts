/**
 * In-browser mock of the CareCircle backend. It lets the whole UI run with
 * no server so the team can demo and test. Replace with a real
 * implementation of `CareCircleApi` (see contract.ts) — do not add new
 * behavior here that the real backend won't have.
 */
import type { AppEvent, CareCircleApi, ExtractionResult, ReminderChannel } from './contract'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
const EVENTS_KEY = 'cc-events-v1'

/** What the sample pharmacy handout (public/sample/levothyroxine-handout.png) says. */
export function sampleExtraction(personId: ExtractionResult['personId'], photoDeleted: boolean): ExtractionResult {
  return {
    documentId: `doc-${Date.now()}`,
    personId,
    documentType: 'pharmacy_handout',
    typeLabel: 'Pharmacy handout',
    title: 'Levothyroxine 50 mcg',
    pageCount: 2,
    medicationId: 'm-levo',
    photoDeleted,
    source: 'mock',
    details: [
      {
        id: 'how',
        category: 'how_to_take',
        label: 'How to take',
        text: 'Take on an empty stomach, 30–60 minutes before breakfast. Wait 45 minutes before coffee.',
        sourcePage: 1,
        critical: true,
        actions: ['add_to_notes', 'update_reminder'],
        pinAs: ['Empty stomach, 30–60 min before breakfast', 'No coffee until 45 min after'],
        reminderUpdate: { reminderId: 'r-levo', newNote: 'Empty stomach. No coffee until 7:45.' },
      },
      {
        id: 'warn',
        category: 'warning_sign',
        label: 'Warning sign',
        text: 'Call the doctor for chest pain, a racing heartbeat, or shaking.',
        sourcePage: 2,
        critical: true,
        actions: ['add_to_notes'],
        pinAs: ['Call the doctor for chest pain, a racing heartbeat, or shaking'],
      },
      {
        id: 'avoid',
        category: 'avoid',
        label: 'Avoid',
        text: 'Take 4 hours apart from calcium or iron supplements.',
        sourcePage: 1,
        critical: true,
        actions: ['add_to_notes', 'add_reminder'],
        pinAs: ['4 hours apart from calcium or iron'],
        reminderDraft: { time: '11:00 AM', title: 'Calcium 600 mg', note: '4 hrs after thyroid pill' },
      },
      { id: 'dose', category: 'dose', label: 'Dose', text: '1 tablet (50 mcg) by mouth once a day.', sourcePage: 1, critical: false, actions: ['add_to_notes'] },
      { id: 'refill', category: 'refill', label: 'Refills', text: '2 refills left · 30-day supply · CVS Pharmacy, 2nd Ave.', sourcePage: 1, critical: false, actions: ['add_reminder'] },
      { id: 'prescriber', category: 'prescriber', label: 'Prescriber', text: 'Dr. Lee · Primary care.', sourcePage: 1, critical: false, actions: [] },
      { id: 'side', category: 'side_effects', label: 'Common side effects', text: 'Hair thinning in the first months, feeling hot, trouble sleeping.', sourcePage: 2, critical: false, actions: ['add_to_notes'] },
      { id: 'missed', category: 'other', label: 'Missed dose', text: 'Take it as soon as you remember. Skip it if it is almost time for the next dose. Do not take two.', sourcePage: 2, critical: false, actions: ['add_to_notes'] },
      { id: 'store', category: 'storage', label: 'Storage', text: 'Room temperature, away from moisture. Not in the bathroom.', sourcePage: 2, critical: false, actions: [] },
    ],
  }
}

export const mockApi: CareCircleApi = {
  async extractDocument(req) {
    // A real backend would: upload → OCR/vision model → structured details →
    // delete the image unless req.keepPhoto. The mock always returns the
    // sample handout so the demo story stays consistent.
    await wait(req.file ? 2200 : 1600)
    return sampleExtraction(req.personId, !req.keepPhoto)
  },
  async saveReview() {
    await wait(250)
    return { documentId: `doc-${Date.now()}` }
  },
  async updateReminder() {
    await wait(200)
  },
  async setReminderStatus() {
    await wait(50)
  },
  async savePrivacySettings() {
    await wait(150)
  },
  async saveNotificationPrefs() {
    await wait(150)
  },
  async sendTestReminder(channels) {
    await wait(300)
    const sent: ReminderChannel[] = []
    const notes: string[] = []
    for (const c of channels) {
      if (c === 'push' || c === 'inApp') sent.push(c)
      if (c === 'text') notes.push('Text messages need the backend (e.g. an SMS provider).')
      if (c === 'email') notes.push('Email needs the backend (e.g. an email provider).')
    }
    return { sent, notes }
  },
  async logEvent(event: AppEvent) {
    try {
      const all = JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AppEvent[]
      all.push(event)
      localStorage.setItem(EVENTS_KEY, JSON.stringify(all.slice(-500)))
    } catch {
      /* storage unavailable — ignore in the mock */
    }
  },
}

export function readLoggedEvents(): AppEvent[] {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') as AppEvent[]
  } catch {
    return []
  }
}
