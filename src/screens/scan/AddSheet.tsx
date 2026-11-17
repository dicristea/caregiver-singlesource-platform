import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Camera, Folder, Lock, Pencil, Watch, X } from 'lucide-react'
import { BottomSheet } from '../../components/layout/layout'
import { OptionCard } from '../../components/domain/domain'
import { Avatar } from '../../components/ui/primitives'
import { useStore } from '../../state/AppStore'
import type { PersonId } from '../../api'

/** 04 Capture sheet — opened from the + button in the tab bar. */
export function AddSheet() {
  const { addOpen, setAddOpen, privacy, showToast, track } = useStore()
  const navigate = useNavigate()
  const [forId, setForId] = useState<PersonId>('elena')
  const close = () => setAddOpen(false)
  const go = (to: string) => {
    close()
    navigate(to)
  }

  const scan = () => {
    if (!privacy.configured) {
      track('privacy_viewed', { variant: 'B' })
      go('/scan/privacy')
    } else go('/scan/choose')
  }

  const chips: Array<{ id: PersonId; label: string; initials: string; tone: 'green' | 'purple' | 'blue' }> = [
    { id: 'ana', label: 'Me', initials: 'A', tone: 'green' },
    { id: 'elena', label: 'Elena', initials: 'EP', tone: 'purple' },
    { id: 'luca', label: 'Luca', initials: 'LP', tone: 'blue' },
  ]

  return (
    <BottomSheet open={addOpen} onClose={close} label="Add something">
      <div className="sheet__header">
        <h2 className="sheet__title">Add something</h2>
        <button type="button" aria-label="Close" onClick={close} className="icon-tile" style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--sand)', color: 'var(--muted)' }}>
          <X size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="row-8">
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>For</span>
        {chips.map((c) => {
          const active = forId === c.id
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={active}
              onClick={() => setForId(c.id)}
              className="row-8"
              style={{
                padding: '5px 14px 5px 6px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                background: active ? 'var(--lavender)' : 'var(--sand)',
                color: active ? 'var(--purple)' : 'var(--ink)',
                border: active ? '1.5px solid var(--purple)' : '1.5px solid transparent',
              }}
            >
              <Avatar initials={c.initials} tone={active ? 'white' : c.tone} size={26} />
              {c.label}
            </button>
          )
        })}
      </div>
      <OptionCard icon={Camera} tileTone="green" solidTile="var(--green)" title="Scan a document" subtitle="Visit summary, discharge sheet, bill or pharmacy handout" onClick={scan} />
      <OptionCard icon={Watch} tileTone="purple" solidTile="var(--purple)" title="Pair a wearable" subtitle="Apple Watch, Fitbit or Oura: alerts for falls and low blood pressure" onClick={() => showToast({ text: 'Wearables are next on our roadmap' })} />
      <OptionCard icon={Pencil} tileTone="amber" solidTile="var(--amber)" title="Write a note" subtitle="Questions for the next visit, or anything you notice" onClick={() => go('/people/elena/notes')} />
      <OptionCard icon={Bell} tileTone="teal" solidTile="var(--teal)" title="Set a reminder" subtitle="A dose, refill, appointment or call to make" onClick={() => go('/people/elena/reminders')} />
      <button type="button" className="row-8" style={{ justifyContent: 'center', color: 'var(--green)', fontSize: 14, fontWeight: 600, gap: 6 }} onClick={() => go('/people/elena/documents')}>
        <Folder size={15} strokeWidth={2} />
        See past uploads for Elena
      </button>
      <span className="row-8" style={{ justifyContent: 'center', color: 'var(--muted)', fontSize: 12, gap: 6, marginTop: -6 }}>
        <Lock size={13} strokeWidth={2} color="var(--faint)" />
        Nothing is saved until you choose what to keep
      </span>
    </BottomSheet>
  )
}
