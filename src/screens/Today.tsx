import { useNavigate } from 'react-router-dom'
import { Heart, Route, Sparkles } from 'lucide-react'
import { Page } from '../components/layout/layout'
import { AlertCard, ReminderRow } from '../components/domain/domain'
import { Avatar, Button, Card, ScreenHeader } from '../components/ui/primitives'
import { TODAY_LABEL } from '../data/demo'
import { useStore } from '../state/AppStore'

/** 01 — Today: what is due, across everyone. */
export function Today() {
  const navigate = useNavigate()
  const { reminders, toggleReminderDone, showToast, medications } = useStore()
  const today = reminders.filter((r) => r.onToday).sort((a, b) => a.minutes - b.minutes)
  const handoutPending = medications.find((m) => m.id === 'm-levo')?.tags.some((t) => t.to?.startsWith('/scan'))

  return (
    <Page gap={16}>
      <ScreenHeader
        eyebrow={TODAY_LABEL}
        title="Good morning, Ana"
        right={
          <button type="button" aria-label="Settings" onClick={() => navigate('/settings')} style={{ marginTop: 6 }}>
            <Avatar initials="A" tone="green" size={40} />
          </button>
        }
      />

      <h2 className="t-h3">Needs attention</h2>
      <AlertCard
        tint="red"
        icon={Heart}
        iconColor="var(--red)"
        title="Elena’s blood pressure is low: 88/54"
        subtitle="Apple Watch · 9:12 AM · below her 90/60 line"
        onClick={() => showToast({ text: 'Wearable alerts are next on our roadmap' })}
        actions={
          <>
            <Button size="sm" onClick={() => showToast({ text: 'Calling is available on your iPhone' })}>
              Call Elena
            </Button>
            <Button size="sm" variant="outline" onClick={() => showToast({ text: 'Luca knows you’re checking' })}>
              I’m checking
            </Button>
          </>
        }
      />
      {handoutPending && <AlertCard tint="mint" icon={Sparkles} iconColor="var(--green)" title="4 new details to review" subtitle="From Elena’s new pharmacy handout" onClick={() => navigate('/scan')} />}
      <AlertCard tint="amber" icon={Route} iconColor="var(--amber)" title="Cardiology referral: no decision in 9 days" subtitle="Elena’s plan has it · Your next step is ready" onClick={() => navigate('/navigate/cases/cardiology')} />

      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <h2 className="t-h3">Today</h2>
        <button type="button" style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)' }} onClick={() => navigate('/people/elena/reminders')}>
          See all
        </button>
      </div>
      <Card pad={false}>
        {today.map((r) => (
          <ReminderRow key={r.id} reminder={r} onToggle={() => toggleReminderDone(r.id)} />
        ))}
      </Card>
    </Page>
  )
}
