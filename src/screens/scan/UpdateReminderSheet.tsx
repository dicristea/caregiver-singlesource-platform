import { useState } from 'react'
import { Bell } from 'lucide-react'
import { BottomSheet } from '../../components/layout/layout'
import { Button, Card, IconTile, ListRow, Toggle } from '../../components/ui/primitives'
import { useStore } from '../../state/AppStore'
import { showSystemNotification } from '../../lib/notify'

/** 06 — Confirm before CareCircle changes an existing reminder. */
export function UpdateReminderSheet({ detailId, onClose }: { detailId: string; onClose: () => void }) {
  const { review, reminders, applyReminderUpdate, showPush, notif } = useStore()
  const detail = review?.result.details.find((d) => d.id === detailId)
  const reminder = reminders.find((r) => r.id === detail?.reminderUpdate?.reminderId)
  const [escalate, setEscalate] = useState(reminder?.escalateToLuca ?? true)
  if (!detail?.reminderUpdate || !reminder) return null
  const newNote = detail.reminderUpdate.newNote

  const confirm = async () => {
    await applyReminderUpdate(detailId, escalate)
    onClose()
    // Preview what Ana will see at 7:00 AM (07 Lock screen push).
    const title = `Elena · ${reminder.title}`
    if (notif.push) void showSystemNotification(title, newNote)
    showPush({ title, body: newNote })
  }

  return (
    <BottomSheet open onClose={onClose} label="Update reminder">
      <IconTile icon={Bell} tone="green" size={48} radius={14} iconSize={22} />
      <div className="stack-8" style={{ gap: 6 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: '28px' }}>Update Elena’s {reminder.time} reminder?</h2>
        <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--muted)' }}>Only the note on the reminder changes. The time and dose stay the same.</p>
      </div>
      <div className="stack-8" style={{ gap: 6 }}>
        <p className="t-section">Now</p>
        <div className="compare compare--now">
          <span className="compare__meta">
            <span className="compare__badge">C</span>
            {reminder.time} · Elena
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>{reminder.title}</span>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>{reminder.note}</span>
        </div>
      </div>
      <div className="stack-8" style={{ gap: 6 }}>
        <p className="t-section" style={{ color: 'var(--green)' }}>
          After
        </p>
        <div className="compare compare--after">
          <span className="compare__meta">
            <span className="compare__badge">C</span>
            {reminder.time} · Elena
          </span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{reminder.title}</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--green)' }}>{newNote}</span>
        </div>
      </div>
      <Card pad={false} tint="bg" radius={16}>
        <ListRow medium title="Time" subtitle={`${reminder.time} · every day`} trailing={<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--faint)' }}>Unchanged</span>} />
        <ListRow medium title="If not marked in 30 min" subtitle="Alert Luca" trailing={<Toggle label="Alert Luca if not marked in 30 minutes" checked={escalate} onChange={setEscalate} />} />
      </Card>
      <Button size="lg" full onClick={confirm}>
        Update reminder
      </Button>
      <button type="button" style={{ alignSelf: 'center', fontSize: 16, fontWeight: 500, color: 'var(--muted)' }} onClick={onClose}>
        Keep as is
      </button>
    </BottomSheet>
  )
}
