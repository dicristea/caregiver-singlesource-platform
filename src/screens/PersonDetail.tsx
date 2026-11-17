import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Bell, ChevronRight, Folder, Key, Lock, Phone, Plus, Receipt, Route, Share, Watch } from 'lucide-react'
import { NavBar, Page } from '../components/layout/layout'
import { MedCard, PersonCard, PersonHeader } from '../components/domain/domain'
import { Avatar, Banner, Button, Card, Chip, IconTile, KeyValue, ListRow, Progress, SegmentedControl, Toggle } from '../components/ui/primitives'
import { careTeam, people } from '../data/demo'
import type { PersonId } from '../api'
import type { Reminder } from '../data/types'
import { useStore } from '../state/AppStore'

type Tab = 'overview' | 'meds' | 'notes' | 'reminders'
const tabs: Array<{ value: Tab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'meds', label: 'Meds' },
  { value: 'notes', label: 'Notes' },
  { value: 'reminders', label: 'Reminders' },
]

/** 17 / 03 / 19 / 20 — a person's detail pages. Elena has the full set; Luca and Ana show their summary card. */
export function PersonDetail() {
  const { id = 'elena', tab = 'overview' } = useParams<{ id: PersonId; tab: Tab }>()
  const navigate = useNavigate()
  const { showToast } = useStore()
  const person = people[id as PersonId]
  if (!person) return <Navigate to="/circle" replace />

  const snapshot = (
    <button type="button" className="row-5" onClick={() => showToast({ text: 'Snapshot sharing is coming next' })}>
      <Share size={18} strokeWidth={2} />
      Snapshot
    </button>
  )

  if (id !== 'elena')
    return (
      <Page>
        <NavBar back="Circle" backTo="/circle" right={snapshot} />
        <PersonCard person={person} onOpen={() => undefined} onToast={(text) => showToast({ text })} />
      </Page>
    )

  return (
    <Page>
      <NavBar back="Circle" backTo="/circle" right={snapshot} />
      <PersonHeader person={person} />
      <SegmentedControl value={tab as Tab} onChange={(t) => navigate(`/people/elena${t === 'overview' ? '' : `/${t}`}`, { replace: true })} options={tabs} />
      {tab === 'overview' && <Overview />}
      {tab === 'meds' && <Meds />}
      {tab === 'notes' && <Notes />}
      {tab === 'reminders' && <Reminders />}
    </Page>
  )
}

function Overview() {
  const navigate = useNavigate()
  const { showToast } = useStore()
  return (
    <>
      <Banner tone="red" icon={AlertTriangle}>
        <span style={{ fontSize: 14 }}>Allergic to penicillin</span>
      </Banner>
      <Card tint="red" radius={16} pad={false} onClick={() => navigate('/navigate/cases/cardiology')}>
        <ListRow leading={<Route size={20} color="var(--red)" />} title="Cardiology referral needs you" subtitle={<span style={{ color: 'var(--red)' }}>Elena’s plan · no decision in 9 days</span>} chevron />
      </Card>
      <Card radius={16} pad={false} onClick={() => showToast({ text: 'Wearables are next on our roadmap' })}>
        <ListRow leading={<IconTile icon={Watch} tone="red" size={36} radius={10} iconSize={18} />} title="Vitals · BP 88/54, below her line" subtitle="Apple Watch · 7-day trend and alert rules" chevron />
      </Card>
      <Card radius={16} padding="12px 14px" gap={10} onClick={() => navigate('/navigate')}>
        <div className="row-12">
          <IconTile icon={Receipt} tone="amber" size={36} radius={10} iconSize={18} />
          <span className="stack-2" style={{ flex: 1 }}>
            <span className="t-title">Costs & claims</span>
            <span className="t-sub">Deductible met · 1 claim pending</span>
          </span>
          <ChevronRight size={20} strokeWidth={1.7} color="var(--faint)" />
        </div>
        <Progress value={1240 / 4500} tone="amber" />
        <span className="t-small">$1,240 of $4,500 out-of-pocket this year</span>
      </Card>
      <Card gap={10}>
        <p className="t-section">At a glance</p>
        <KeyValue k="Born" v="Mar 2, 1948" />
        <KeyValue k="Conditions" v="Hypothyroidism, atrial fibrillation, hip replacement (Sep)" />
        <KeyValue k="Language" v="Romanian · Ana interprets" />
        <KeyValue k="Emergency" v="Ana (you) · Luca" />
        <KeyValue k="Plan" v="Medicare Advantage · $1,240 spent this year" color="var(--green)" />
      </Card>
      <p className="t-section">Care team</p>
      <Card pad={false}>
        {careTeam.map((p) => (
          <ListRow
            key={p.name}
            leading={<Avatar initials={p.initials} tone={p.tone} size={40} />}
            title={
              <span className="row-8">
                {p.name}
                {p.badge && (
                  <Chip tone="green" size="xs" style={{ fontSize: 10, padding: '2px 7px' }}>
                    {p.badge}
                  </Chip>
                )}
              </span>
            }
            subtitle={p.role}
            trailing={
              <button type="button" aria-label={`Call ${p.name}`} onClick={() => showToast({ text: 'Calling is available on your iPhone' })}>
                <IconTile icon={Phone} tone="green" size={34} radius={17} iconSize={16} />
              </button>
            }
          />
        ))}
      </Card>
      <Card pad={false}>
        <div className="row-8" style={{ padding: '14px 16px 4px', justifyContent: 'space-between' }}>
          <p className="t-section">Portals & logins</p>
          <Chip tone="green" size="xs" icon={Lock}>
            Face ID
          </Chip>
        </div>
        <ListRow leading={<IconTile icon={Key} tone="green" size={34} radius={10} iconSize={16} />} title="Riverside MyChart" subtitle="Login saved · proxy access on" trailing={<Button variant="outline" size="sm">Open</Button>} />
        <ListRow leading={<IconTile icon={Key} tone="green" size={34} radius={10} iconSize={16} />} title="Elena’s plan member portal" subtitle="Login saved" trailing={<Button variant="outline" size="sm">Open</Button>} />
        <ListRow leading={<IconTile icon={Lock} tone="neutral" size={34} radius={10} iconSize={16} />} title="Dr. Lee’s patient portal" subtitle="No login yet" trailing={<Button variant="soft" size="sm" icon={Plus}>Add login</Button>} />
        <span className="row-8" style={{ padding: '10px 16px 14px', fontSize: 12, color: 'var(--muted)', alignItems: 'flex-start', borderTop: '1px solid var(--line)' }}>
          <Lock size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          Passwords stay in your iPhone’s Keychain, unlocked with Face ID. CareCircle never stores or sees them.
        </span>
      </Card>
    </>
  )
}

function Meds() {
  const { medications, showToast } = useStore()
  const meds = medications.filter((m) => m.personId === 'elena')
  return (
    <>
      <Banner tone="red" icon={AlertTriangle}>
        Allergic to penicillin
      </Banner>
      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <h2 className="t-h3">{meds.length} medications</h2>
        <Button variant="soft" size="sm" icon={Plus} onClick={() => showToast({ text: 'Tip: scanning the pharmacy label is fastest' })}>
          Add medication
        </Button>
      </div>
      {meds.map((m) => (
        <MedCard key={m.id} med={m} />
      ))}
    </>
  )
}

function Notes() {
  const navigate = useNavigate()
  const { documents } = useStore()
  const count = documents.filter((d) => d.personId === 'elena').length
  return (
    <>
      <Card radius={16} pad={false} onClick={() => navigate('/people/elena/documents')}>
        <ListRow leading={<IconTile icon={Folder} tone="neutral" size={36} radius={10} iconSize={18} />} title={`Documents · ${count} scanned`} subtitle="Everything scanned for Elena, and what it set up" chevron />
      </Card>
      <p className="t-section">Questions for Dr. Lee · Thu, Oct 22</p>
      <Card pad={false}>
        {['Is 50 mcg still the right thyroid dose after surgery?', 'Can the Apixaban price be lowered? It jumped to $340.', 'When should the cardiology visit happen?'].map((q) => (
          <ListRow key={q} medium title={q} />
        ))}
      </Card>
      <p className="t-section">Things you noticed</p>
      <Card gap={6}>
        <span className="t-small">Oct 11 · Ana</span>
        <span className="t-body">Dizzy when standing up after lunch. Drank water, felt better in 10 min.</span>
      </Card>
    </>
  )
}

function Reminders() {
  const { reminders, setReminderEnabled, showToast } = useStore()
  const mine = reminders.filter((r) => r.personId === 'elena')
  const group = (label: string, list: Reminder[]) => (
    <section className="stack-8">
      <p className="t-section">{label}</p>
      <Card pad={false}>
        {list.map((r) => (
          <div key={r.id} className="list-row">
            <span style={{ width: 82, fontSize: 13, fontWeight: 600, color: 'var(--muted)', flexShrink: 0 }}>{r.id.startsWith('r-apix') ? '8 AM · 8 PM' : r.time}</span>
            <span className="list-row__body">
              <span className="list-row__title">{r.title}</span>
              <span className="list-row__sub">{r.id.startsWith('r-apix') ? 'With meals' : r.note}</span>
              {r.caseChip && (
                <span style={{ marginTop: 2 }}>
                  <Chip tone="red" size="xs" icon={Route}>
                    {r.caseChip}
                  </Chip>
                </span>
              )}
            </span>
            <Toggle label={`${r.title} reminder`} checked={r.enabled} onChange={(v) => setReminderEnabled(r.id, v)} />
          </div>
        ))}
      </Card>
    </section>
  )
  const daily = mine.filter((r) => r.group === 'daily' && r.id !== 'r-apix-pm')
  return (
    <>
      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <h2 className="t-h3">{mine.length - 1} reminders for Elena</h2>
        <Button size="sm" icon={Plus} onClick={() => showToast({ text: 'Scan a document and CareCircle drafts the reminders' })}>
          New reminder
        </Button>
      </div>
      {group('Daily meds', daily)}
      {group('Refills', mine.filter((r) => r.group === 'refill'))}
      {group('Visits & follow-ups', mine.filter((r) => r.group === 'visit'))}
      <span className="row-8" style={{ fontSize: 12, color: 'var(--muted)' }}>
        <Bell size={14} strokeWidth={2} />
        If a dose isn’t marked within 30 min, Luca gets an alert.
      </span>
    </>
  )
}
