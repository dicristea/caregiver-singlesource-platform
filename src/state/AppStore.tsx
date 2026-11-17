/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api } from '../api'
import type { EventName, ExtractionResult, NotificationPrefs, PrivacySettings, ReminderStatus } from '../api'
import { seedDocuments, seedMedications, seedReminders } from '../data/demo'
import type { DocRecord, Medication, Reminder } from '../data/types'

/* ── State shape ─────────────────────────────────────────────────────── */

export interface ReviewSession {
  result: ExtractionResult
  kept: string[]
  edits: Record<string, string>
  reminderUpdated: boolean
  addedReminders: string[]
  real: boolean
}

interface PersistedState {
  reminders: Reminder[]
  medications: Medication[]
  documents: DocRecord[]
  privacy: PrivacySettings
  notif: NotificationPrefs
  review: ReviewSession | null
}

export interface Toast {
  text: string
  actionLabel?: string
  onAction?: () => void
}
export interface PushPreview {
  title: string
  body: string
}

const STORAGE_KEY = 'cc-state-v1'

const initialState = (): PersistedState => ({
  reminders: seedReminders,
  medications: seedMedications,
  documents: seedDocuments,
  privacy: { configured: false, sharedWithLuca: true, sharedWithFutureInvitees: false, keepPhoto: false },
  notif: { push: true, text: false, email: false, inApp: true },
  review: null,
})

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...initialState(), ...(JSON.parse(raw) as PersistedState) }
  } catch {
    /* ignore */
  }
  return initialState()
}

/* ── Context ─────────────────────────────────────────────────────────── */

interface Store extends PersistedState {
  toast: Toast | null
  push: PushPreview | null
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  showToast: (t: Toast) => void
  showPush: (p: PushPreview) => void
  track: (name: EventName, props?: Record<string, string | number | boolean>) => void

  setReminderStatus: (id: string, status: ReminderStatus) => void
  toggleReminderDone: (id: string) => void
  setReminderEnabled: (id: string, enabled: boolean) => void
  savePrivacy: (p: PrivacySettings) => Promise<void>
  saveNotif: (n: NotificationPrefs) => Promise<void>

  startReview: (result: ExtractionResult, real: boolean) => void
  toggleKeep: (detailId: string) => void
  editDetail: (detailId: string, text: string) => void
  applyReminderUpdate: (detailId: string, escalateToLuca: boolean) => Promise<void>
  addDraftReminder: (detailId: string) => void
  finishReview: () => Promise<void>
  cancelReview: () => void
  resetDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load)
  const [toast, setToast] = useState<Toast | null>(null)
  const [push, setPush] = useState<PushPreview | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)
  const pushTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const showToast = useCallback((t: Toast) => {
    window.clearTimeout(toastTimer.current)
    setToast(t)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const showPush = useCallback((p: PushPreview) => {
    window.clearTimeout(pushTimer.current)
    setPush(p)
    pushTimer.current = window.setTimeout(() => setPush(null), 5000)
  }, [])

  const track = useCallback((name: EventName, props?: Record<string, string | number | boolean>) => {
    void api.logEvent({ name, props, at: new Date().toISOString() })
  }, [])

  const patch = useCallback((fn: (s: PersistedState) => Partial<PersistedState>) => setState((s) => ({ ...s, ...fn(s) })), [])

  const setReminderStatus = useCallback(
    (id: string, status: ReminderStatus) => {
      patch((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, status } : r)) }))
      void api.setReminderStatus(id, status)
      if (status === 'done') track('reminder_marked_done', { reminderId: id })
    },
    [patch, track],
  )

  const toggleReminderDone = useCallback(
    (id: string) => {
      const r = state.reminders.find((x) => x.id === id)
      if (!r) return
      setReminderStatus(id, r.status === 'done' ? 'due' : 'done')
    },
    [state.reminders, setReminderStatus],
  )

  const setReminderEnabled = useCallback(
    (id: string, enabled: boolean) => {
      patch((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, enabled } : r)) }))
      void api.updateReminder({ reminderId: id, enabled })
    },
    [patch],
  )

  const savePrivacy = useCallback(
    async (p: PrivacySettings) => {
      patch(() => ({ privacy: p }))
      await api.savePrivacySettings(p)
      track('privacy_saved', { sharedWithLuca: p.sharedWithLuca, sharedWithFutureInvitees: p.sharedWithFutureInvitees, keepPhoto: p.keepPhoto })
    },
    [patch, track],
  )

  const saveNotif = useCallback(
    async (n: NotificationPrefs) => {
      patch(() => ({ notif: n }))
      await api.saveNotificationPrefs(n)
    },
    [patch],
  )

  const startReview = useCallback(
    (result: ExtractionResult, real: boolean) => {
      patch(() => ({ review: { result, kept: [], edits: {}, reminderUpdated: false, addedReminders: [], real } }))
    },
    [patch],
  )

  const toggleKeep = useCallback(
    (detailId: string) => {
      patch((s) => {
        if (!s.review) return {}
        const kept = s.review.kept.includes(detailId) ? s.review.kept.filter((k) => k !== detailId) : [...s.review.kept, detailId]
        return { review: { ...s.review, kept } }
      })
      track('detail_kept', { detailId })
    },
    [patch, track],
  )

  const editDetail = useCallback(
    (detailId: string, text: string) => {
      patch((s) => (s.review ? { review: { ...s.review, edits: { ...s.review.edits, [detailId]: text } } } : {}))
      track('detail_edited', { detailId })
    },
    [patch, track],
  )

  const applyReminderUpdate = useCallback(
    async (detailId: string, escalateToLuca: boolean) => {
      const d = state.review?.result.details.find((x) => x.id === detailId)
      if (!d?.reminderUpdate) return
      const { reminderId, newNote } = d.reminderUpdate
      patch((s) => ({
        reminders: s.reminders.map((r) => (r.id === reminderId ? { ...r, note: newNote, escalateToLuca } : r)),
        review: s.review ? { ...s.review, reminderUpdated: true, kept: s.review.kept.includes(detailId) ? s.review.kept : [...s.review.kept, detailId] } : null,
      }))
      await api.updateReminder({ reminderId, note: newNote, escalateToLuca })
      track('reminder_updated', { reminderId })
    },
    [state.review, patch, track],
  )

  const addDraftReminder = useCallback(
    (detailId: string) => {
      patch((s) => (s.review && !s.review.addedReminders.includes(detailId) ? { review: { ...s.review, addedReminders: [...s.review.addedReminders, detailId] } } : {}))
    },
    [patch],
  )

  const finishReview = useCallback(async () => {
    const review = state.review
    if (!review) return
    const { result, kept, edits } = review
    await api.saveReview({ documentId: result.documentId, personId: result.personId, keptDetailIds: kept, edits })
    const keptDetails = result.details.filter((d) => kept.includes(d.id))
    const newRules = keptDetails.flatMap((d) => (edits[d.id] ? [edits[d.id]] : (d.pinAs ?? [])))
    const outcome = [newRules.length ? `${newRules.length} rule${newRules.length === 1 ? '' : 's'} pinned` : null, review.reminderUpdated ? 'reminder updated' : null].filter(Boolean).join(' · ') || 'Saved for reference'
    const doc: DocRecord = {
      id: result.documentId,
      personId: result.personId,
      kind: 'Rx',
      title: 'Levothyroxine handout',
      meta: 'Prescription · Oct 13 · by Ana',
      outcome,
      outcomeTone: 'green',
      month: 'OCTOBER',
      to: '/people/elena/meds',
    }
    patch((s) => ({
      documents: [doc, ...s.documents.filter((x) => x.title !== doc.title)],
      medications: s.medications.map((m) =>
        m.id === result.medicationId
          ? {
              ...m,
              rules: Array.from(new Set([...m.rules, ...newRules])),
              tags: [...m.tags.filter((t) => !t.to?.startsWith('/scan')), ...(m.tags.some((t) => t.icon === 'image') ? [] : [{ label: 'From pharmacy handout', tone: 'neutral' as const, icon: 'image' as const, to: '/people/elena/documents' }])],
            }
          : m,
      ),
      review: null,
    }))
  }, [state.review, patch])

  const cancelReview = useCallback(() => patch(() => ({ review: null })), [patch])

  const resetDemo = useCallback(() => {
    setState(initialState())
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const value = useMemo<Store>(
    () => ({
      ...state,
      toast,
      push,
      addOpen,
      setAddOpen,
      showToast,
      showPush,
      track,
      setReminderStatus,
      toggleReminderDone,
      setReminderEnabled,
      savePrivacy,
      saveNotif,
      startReview,
      toggleKeep,
      editDetail,
      applyReminderUpdate,
      addDraftReminder,
      finishReview,
      cancelReview,
      resetDemo,
    }),
    [state, toast, push, addOpen, showToast, showPush, track, setReminderStatus, toggleReminderDone, setReminderEnabled, savePrivacy, saveNotif, startReview, toggleKeep, editDetail, applyReminderUpdate, addDraftReminder, finishReview, cancelReview, resetDemo],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside <AppStoreProvider>')
  return s
}
