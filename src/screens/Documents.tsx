import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Camera, ChevronRight, Lock, Search } from 'lucide-react'
import { NavBar, Page } from '../components/layout/layout'
import { DocRow } from '../components/domain/domain'
import { Banner, Card, Chip, ScreenHeader } from '../components/ui/primitives'
import { useStore } from '../state/AppStore'
import type { DocKind } from '../data/types'

const filters: Array<{ label: string; kinds?: DocKind[] }> = [
  { label: 'All' },
  { label: 'Prescriptions', kinds: ['Rx'] },
  { label: 'Bills & EOBs', kinds: ['Bill', 'EOB'] },
  { label: 'Visits', kinds: ['Visit', 'Dc'] },
  { label: 'Insurance', kinds: ['Card'] },
]

/** 27 — Everything scanned for Elena, and what each document set up. */
export function Documents() {
  const navigate = useNavigate()
  const { documents } = useStore()
  const [filter, setFilter] = useState(0)
  const [q, setQ] = useState('')
  const f = filters[filter]
  const docs = documents.filter((d) => d.personId === 'elena' && (!f.kinds || f.kinds.includes(d.kind)) && d.title.toLowerCase().includes(q.toLowerCase()))
  const months = Array.from(new Set(docs.map((d) => d.month)))

  return (
    <Page>
      <NavBar
        back="Notes"
        backTo="/people/elena/notes"
        right={
          <button type="button" className="row-5" onClick={() => navigate('/scan')}>
            <Camera size={18} strokeWidth={2} />
            Scan
          </button>
        }
      />
      <ScreenHeader title="Documents" subtitle="Everything scanned for Elena, and what it set up" />
      <label className="row-8" style={{ background: 'var(--segment)', borderRadius: 12, padding: '10px 12px' }}>
        <Search size={17} strokeWidth={2} color="var(--faint)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bills, prescriptions, notes" aria-label="Search documents" style={{ border: 0, background: 'none', outline: 'none', fontSize: 15, flex: 1 }} />
      </label>
      <div className="chip-row">
        {filters.map((x, i) =>
          i === filter ? (
            <Chip key={x.label} tone="dark" size="md">
              {x.label}
              {i === 0 && ` ${documents.filter((d) => d.personId === 'elena').length}`}
            </Chip>
          ) : (
            <Chip key={x.label} outline size="md" onClick={() => setFilter(i)}>
              {x.label}
            </Chip>
          ),
        )}
      </div>
      <Banner tone="amber" icon={AlertTriangle} onClick={() => navigate('/navigate/cases/pt')} trailing={<ChevronRight size={18} />}>
        1 document has details left to review
      </Banner>
      {months.map((m) => (
        <section key={m} className="stack-8">
          <p className="t-section">{m}</p>
          <Card pad={false} radius={18}>
            {docs
              .filter((d) => d.month === m)
              .map((d) => (
                <DocRow key={d.id} doc={d} onOpen={() => d.to && navigate(d.to)} />
              ))}
          </Card>
        </section>
      ))}
      <span className="row-8" style={{ fontSize: 12, color: 'var(--muted)', alignItems: 'flex-start' }}>
        <Lock size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
        Only the details are kept unless you chose “Keep the photo too.” Export or delete anytime in Settings.
      </span>
    </Page>
  )
}
