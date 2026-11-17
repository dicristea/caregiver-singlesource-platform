import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, CreditCard, Folder, Phone, Search, ShieldCheck } from 'lucide-react'
import { Page } from '../components/layout/layout'
import { CaseCard } from '../components/domain/domain'
import { Card, Chip, IconTile, ListRow, Progress, ScreenHeader, SegmentedControl } from '../components/ui/primitives'
import { seedCases, seedClaims } from '../data/demo'
import type { PersonId } from '../api'
import { useStore } from '../state/AppStore'

type Seg = 'costs' | 'cases' | 'resources'
const segFromPath = (p: string): Seg => (p.endsWith('/cases') ? 'cases' : p.endsWith('/resources') ? 'resources' : 'costs')

/** 28 / 12 — Navigate: costs & claims, open cases, resources. */
export function NavigateScreen() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const seg = segFromPath(pathname)
  return (
    <Page>
      <ScreenHeader title="Navigate" subtitle="Costs, claims and coverage for everyone you care for" />
      <SegmentedControl
        value={seg}
        onChange={(s) => navigate(s === 'costs' ? '/navigate' : `/navigate/${s}`, { replace: true })}
        options={[
          { value: 'costs', label: 'Costs & claims' },
          { value: 'cases', label: 'Open cases' },
          { value: 'resources', label: 'Resources' },
        ]}
      />
      {seg === 'costs' && <Costs />}
      {seg === 'cases' && <Cases />}
      {seg === 'resources' && (
        <Card gap={10}>
          <IconTile icon={BookOpen} tone="teal" size={40} radius={12} />
          <span className="t-h3">Resources are coming soon</span>
          <span className="t-sub">Plan rules in plain words, open enrollment help and local programs picked for Elena.</span>
        </Card>
      )}
    </Page>
  )
}

function Costs() {
  const navigate = useNavigate()
  const { showToast } = useStore()
  const [who, setWho] = useState<PersonId>('elena')
  const soon = () => showToast({ text: 'Coming next' })
  return (
    <>
      <div className="chip-row">
        {(['ana', 'elena', 'luca'] as PersonId[]).map((p) =>
          p === who ? (
            <Chip key={p} tone="purple" size="lg">
              {p === 'ana' ? 'Me' : p === 'elena' ? 'Elena' : 'Luca'}
            </Chip>
          ) : (
            <Chip key={p} outline size="lg" onClick={() => setWho(p)}>
              {p === 'ana' ? 'Me' : p === 'elena' ? 'Elena' : 'Luca'}
            </Chip>
          ),
        )}
      </div>
      <div className="row-12" style={{ background: 'var(--green)', color: '#fff', borderRadius: 18, padding: '14px 16px' }}>
        <CreditCard size={24} strokeWidth={1.8} />
        <span className="stack-2" style={{ flex: 1 }}>
          <span className="t-title">{who === 'elena' ? 'Medicare Advantage HMO' : 'Empire Blue Cross (PPO)'}</span>
          <span style={{ fontSize: 12, color: '#d8ece5' }}>Member ID •••• {who === 'elena' ? '4821' : '1907'} · plan year ends Dec 31</span>
        </span>
        <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 18, background: '#fff', color: 'var(--green)' }}>
          <Phone size={16} strokeWidth={2} />
        </span>
      </div>
      <Card gap={12}>
        <p className="t-section">This year</p>
        <div className="row-8">
          <span className="t-title" style={{ flex: 1 }}>
            Deductible{' '}
            <Chip tone="green" size="xs" icon={Check}>
              Met
            </Chip>
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>$500 of $500</span>
        </div>
        <Progress value={1} />
        <div className="row-8">
          <span className="t-title" style={{ flex: 1 }}>
            Out-of-pocket
          </span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--muted)' }}>$1,240 of $4,500</span>
        </div>
        <Progress value={1240 / 4500} tone="amber" />
        <span className="t-sub">After $3,260 more, in-network care is fully covered until Dec 31.</span>
        <div className="btn-row">
          {[
            ['Primary care', '$0'],
            ['Specialist', '$40'],
            ['ER', '$95'],
          ].map(([k, v]) => (
            <span key={k} className="stack-2" style={{ flex: 1, background: 'var(--bg)', borderRadius: 12, padding: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{v}</span>
            </span>
          ))}
        </div>
      </Card>
      <p className="t-section">Recent claims</p>
      <Card pad={false} radius={18}>
        {seedClaims.map((c) => (
          <ListRow key={c.id} title={c.title} subtitle={c.meta} onClick={c.to ? () => navigate(c.to!) : undefined} trailing={<Chip tone={c.status.tone}>{c.status.label}</Chip>} />
        ))}
      </Card>
      <p className="t-section">Tools</p>
      <Card pad={false} radius={18}>
        <ListRow leading={<IconTile icon={Search} tone="teal" size={34} radius={10} iconSize={16} />} title="Is this doctor in network?" subtitle="Check before you book or call" chevron onClick={soon} />
        <ListRow leading={<IconTile icon={Folder} tone="neutral" size={34} radius={10} iconSize={16} />} title="Bills and EOBs · 6 scanned" subtitle="Every number above traces to one" chevron onClick={() => navigate('/people/elena/documents')} />
        <ListRow leading={<IconTile icon={BookOpen} tone="neutral" size={34} radius={10} iconSize={16} />} title="Plan rules in plain words" subtitle="Referrals, prior auth, network" chevron onClick={soon} />
        <ListRow leading={<IconTile icon={ShieldCheck} tone="teal" size={34} radius={10} iconSize={16} />} title="Open enrollment until Dec 7" subtitle="Compare plans for next year" chevron onClick={soon} />
      </Card>
    </>
  )
}

function Cases() {
  const navigate = useNavigate()
  const [who, setWho] = useState<'all' | PersonId>('all')
  const cases = seedCases.filter((c) => who === 'all' || c.personId === who)
  const count = (p: PersonId) => seedCases.filter((c) => c.personId === p).length
  const filter = (id: 'all' | PersonId, label: string, tone: 'dark' | 'green' | 'purple' | 'blue') => (
    <Chip key={id} tone={who === id ? 'dark' : tone} size="sm" onClick={() => setWho(id)}>
      {label}
    </Chip>
  )
  return (
    <>
      <div className="row-8" style={{ gap: 6 }}>
        <h2 className="t-h3" style={{ flex: 1 }}>
          Open cases
        </h2>
        {filter('all', `All ${seedCases.length}`, 'dark')}
        {filter('ana', 'Me', 'green')}
        {filter('elena', `Elena ${count('elena')}`, 'purple')}
        {filter('luca', `Luca ${count('luca')}`, 'blue')}
      </div>
      {cases.map((c) => (
        <CaseCard key={c.id} c={c} onOpen={() => navigate(`/navigate/cases/${c.id}`)} />
      ))}
      {cases.length === 0 && <p className="t-sub">No open cases for you right now.</p>}
      <Card gap={10} onClick={() => navigate('/navigate/resources')}>
        <div className="row-12">
          <IconTile icon={BookOpen} tone="teal" size={36} radius={10} iconSize={18} />
          <span className="stack-2" style={{ flex: 1 }}>
            <span className="t-title">Resources picked for Elena</span>
            <span className="t-sub">Medicare Open Enrollment is open until Dec 7</span>
          </span>
          <ChevronRight size={20} strokeWidth={1.7} color="var(--faint)" />
        </div>
      </Card>
    </>
  )
}
