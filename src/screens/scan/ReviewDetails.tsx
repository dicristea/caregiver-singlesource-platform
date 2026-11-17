import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AlertTriangle, Bell, Check, ChevronDown, Clock, Image as ImageIcon, Info, Lock, Pencil, Plus, Sparkles, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavBar, Page } from '../../components/layout/layout'
import { Button, Card, Chip } from '../../components/ui/primitives'
import type { Tone } from '../../components/ui/tone'
import { isMockBackend } from '../../api'
import type { DetailCategory, ExtractedDetail } from '../../api'
import { useStore } from '../../state/AppStore'
import { UpdateReminderSheet } from './UpdateReminderSheet'
import './review.css'

const categoryStyle: Partial<Record<DetailCategory, { tone: Tone; icon: LucideIcon }>> = {
  how_to_take: { tone: 'green', icon: Clock },
  warning_sign: { tone: 'red', icon: AlertTriangle },
  avoid: { tone: 'amber', icon: X },
}

/** 05 — Review details. The caregiver approves (and can edit) every detail before it is saved. */
export function ReviewDetails() {
  const navigate = useNavigate()
  const store = useStore()
  const { review, toggleKeep, finishReview, cancelReview, showToast } = store
  const [sheetFor, setSheetFor] = useState<string | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)

  if (!review) return <Navigate to="/" replace />
  const { result, kept, edits, reminderUpdated, addedReminders } = review
  const critical = result.details.filter((d) => d.critical)
  const more = result.details.filter((d) => !d.critical)

  const keep = (d: ExtractedDetail) => {
    const wasKept = kept.includes(d.id)
    toggleKeep(d.id)
    if (!wasKept) showToast({ text: `Added to ${result.title.split(' ')[0]}`, actionLabel: 'Undo', onAction: () => toggleKeep(d.id) })
  }

  // Navigate first: once the review is cleared this screen would redirect to Today.
  const done = async () => {
    navigate('/people/elena/meds', { replace: true })
    await finishReview()
    showToast({ text: 'Saved to Elena’s meds' })
  }

  const cancel = () => {
    navigate('/', { replace: true })
    cancelReview()
  }

  return (
    <Page
      tabs={false}
      overlay={sheetFor && <UpdateReminderSheet detailId={sheetFor} onClose={() => setSheetFor(null)} />}
    >
      <NavBar back="Cancel" muted onBack={cancel} title="Review details" right={<button type="button" onClick={done}>Done</button>} />

      <Card shadow padding="16px" gap={0}>
        <div className="row-14">
          <img className="review__thumb" src="/sample/levothyroxine-handout.png" alt="" />
          <div className="stack-3" style={{ flex: 1 }}>
            <span>
              <Chip tone="green" size="sm" icon={Sparkles}>
                {result.typeLabel}
              </Chip>
            </span>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{result.title}</span>
            <span className="t-sub">For Elena · scanned just now · {result.pageCount} pages</span>
          </div>
        </div>
      </Card>

      {result.photoDeleted && (
        <span className="row-8" style={{ fontSize: 13, color: 'var(--muted)', gap: 6, marginTop: -4 }}>
          <Lock size={13} strokeWidth={2.2} color="var(--green)" />
          Photo deleted after reading. Only the details below are kept.
        </span>
      )}
      {isMockBackend && result.source === 'mock' && (
        <span className="review__demo">
          <Info size={14} strokeWidth={2.2} />
          Demo mode: details come from the sample handout until the extraction backend is connected.
        </span>
      )}

      <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--muted)' }}>
        {critical.length} critical details found. Tap + to keep what matters.
      </p>

      {critical.map((d) => (
        <DetailCard
          key={d.id}
          detail={d}
          text={edits[d.id] ?? d.text}
          kept={kept.includes(d.id)}
          reminderUpdated={reminderUpdated}
          reminderAdded={addedReminders.includes(d.id)}
          onKeep={() => keep(d)}
          onUpdateReminder={() => setSheetFor(d.id)}
          onAddReminder={() => {
            store.addDraftReminder(d.id)
            if (!kept.includes(d.id)) toggleKeep(d.id)
            showToast({ text: `Reminder added · ${d.reminderDraft?.time ?? ''}` })
          }}
        />
      ))}

      <button type="button" className="review__more" onClick={() => setMoreOpen((o) => !o)} aria-expanded={moreOpen}>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>More from this document</span>
        <span className="review__count">{more.length}</span>
        <ChevronDown size={18} strokeWidth={1.8} color="var(--muted)" style={{ transform: moreOpen ? 'rotate(180deg)' : undefined }} />
      </button>
      {moreOpen && (
        <Card pad={false}>
          {more.map((d) => (
            <div key={d.id} className="list-row list-row--top">
              <span className="list-row__body">
                <span className="t-section">{d.label}</span>
                <span style={{ fontSize: 14, lineHeight: '20px' }}>{d.text}</span>
              </span>
              {d.actions.includes('add_to_notes') && (
                <button type="button" aria-label={`Keep ${d.label}`} className={`review__mini${kept.includes(d.id) ? ' review__mini--on' : ''}`} onClick={() => keep(d)}>
                  {kept.includes(d.id) ? <Check size={14} strokeWidth={2.6} /> : <Plus size={14} strokeWidth={2.4} />}
                </button>
              )}
            </div>
          ))}
        </Card>
      )}

      <p style={{ fontSize: 12, lineHeight: '17px', color: 'var(--faint)' }}>CareCircle shows what the document says. Double-check with your pharmacist or doctor.</p>
    </Page>
  )
}

function DetailCard({ detail, text, kept, reminderUpdated, reminderAdded, onKeep, onUpdateReminder, onAddReminder }: { detail: ExtractedDetail; text: string; kept: boolean; reminderUpdated: boolean; reminderAdded: boolean; onKeep: () => void; onUpdateReminder: () => void; onAddReminder: () => void }) {
  const { editDetail } = useStore()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const style = categoryStyle[detail.category] ?? { tone: 'neutral' as Tone, icon: Info }
  const actions = detail.actions

  return (
    <Card shadow selected={kept} gap={12}>
      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <Chip tone={style.tone} size="sm" icon={style.icon}>
          {detail.label}
        </Chip>
        <span className="row-8" style={{ gap: 10 }}>
          {!editing && (
            <button type="button" aria-label={`Edit ${detail.label}`} className="row-5" style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }} onClick={() => setEditing(true)}>
              <Pencil size={13} strokeWidth={2} color="var(--faint)" />
              Edit
            </button>
          )}
          <span className="row-5" style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', gap: 4 }}>
            <ImageIcon size={13} strokeWidth={2} color="var(--faint)" />
            Page {detail.sourcePage}
          </span>
        </span>
      </div>

      {editing ? (
        <div className="stack-8">
          <textarea className="review__edit" value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus aria-label={`${detail.label} text`} />
          <div className="btn-row">
            <Button variant="outline" onClick={() => { setDraft(text); setEditing(false) }}>Cancel</Button>
            <Button onClick={() => { editDetail(detail.id, draft.trim()); setEditing(false) }}>Save edit</Button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: '23px' }}>{text}</p>
      )}

      {!editing && (
        <div className="btn-row">
          {actions.includes('add_to_notes') &&
            (kept ? (
              <Button variant="primary" icon={Check} onClick={onKeep}>
                Added to notes
              </Button>
            ) : (
              <Button variant="outline" icon={Plus} onClick={onKeep}>
                Add to notes
              </Button>
            ))}
          {actions.includes('update_reminder') &&
            (reminderUpdated ? (
              <Button variant="soft" icon={Bell}>
                Reminder updated
              </Button>
            ) : (
              <Button variant="outline" icon={Bell} onClick={onUpdateReminder}>
                Update reminder
              </Button>
            ))}
          {actions.includes('add_reminder') &&
            (reminderAdded ? (
              <Button variant="soft" icon={Bell}>
                Reminder added
              </Button>
            ) : (
              <Button variant="outline" icon={Bell} onClick={onAddReminder}>
                Add reminder
              </Button>
            ))}
        </div>
      )}
    </Card>
  )
}
