import type { PersonId, ReminderStatus } from '../api/contract'
import type { Tone } from '../components/ui/tone'

export interface Person {
  id: PersonId
  fullName: string
  firstName: string
  initials: string
  tone: Tone
  /** "Elena · 78 · Medicare" style line under the name. */
  summary: string
  extraLine?: string
  allergies: Array<{ label: string; tone: Tone }>
  conditions: Array<{ label: string; tone?: Tone }>
  facts: Array<{ k: string; v: string }>
  insurance: string
}

export interface Reminder {
  id: string
  personId: PersonId
  /** Display time, e.g. "7:00 AM" or "Tue, Oct 20". */
  time: string
  /** For sorting today's timeline. */
  minutes: number
  title: string
  note: string
  status: ReminderStatus
  group: 'daily' | 'refill' | 'visit' | 'task'
  enabled: boolean
  onToday: boolean
  escalateToLuca?: boolean
  caseChip?: string
}

export interface Medication {
  id: string
  personId: PersonId
  name: string
  purpose: string
  rules: string[]
  tags: Array<{ label: string; tone: Tone; icon?: 'clock' | 'image' | 'alert' | 'sparkle'; to?: string }>
}

export interface CareCase {
  id: string
  personId: PersonId
  kind: 'Referral' | 'Bill' | 'Discharge' | 'Denial'
  title: string
  status: { label: string; tone: Tone }
  holder: string
  progress: number
  progressTone: Tone
  nextStep: string
  source: string
  /** Detail page content */
  whoHasIt: { title: string; wait: string; explainer: string; sourceChip: string; tone: Tone }
  nextAction: { headline: string; script: string[]; primary: string }
  path: Array<{ label: string; by: string; state: 'done' | 'stalled' | 'todo' }>
  callLog: Array<{ meta: string; text: string }>
  bill?: { owe: string; due: string; service: string; warning: string; whoToCall: Array<{ name: string; detail: string; primary: boolean }>; ask: string[] }
}

export type DocKind = 'Rx' | 'Bill' | 'EOB' | 'Visit' | 'Card' | 'Dc'

export interface DocRecord {
  id: string
  personId: PersonId
  kind: DocKind
  title: string
  meta: string
  outcome: string
  outcomeTone: 'green' | 'amber'
  month: string
  to?: string
}

export interface Claim {
  id: string
  title: string
  meta: string
  status: { label: string; tone: Tone }
  to?: string
}
