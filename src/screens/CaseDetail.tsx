import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Bell, BookOpen, Check, Copy, DollarSign, Image as ImageIcon, MessageSquare, Pencil, Phone, Receipt, Route, ShieldCheck, Volume2 } from 'lucide-react'
import { NavBar, Page } from '../components/layout/layout'
import { Avatar, Button, Card, Chip, IconTile, NumberedSteps } from '../components/ui/primitives'
import { people, seedCases } from '../data/demo'
import type { CareCase } from '../data/types'
import { useStore } from '../state/AppStore'

/** 13 / 08 — One case: who has it now, your next step, the path, and the call log. */
export function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useStore()
  const c = seedCases.find((x) => x.id === id)
  if (!c) return <Navigate to="/navigate/cases" replace />
  const person = people[c.personId]
  const copy = (lines: string[]) => {
    void navigator.clipboard?.writeText(lines.map((l, i) => `${i + 1}. ${l}`).join('\n'))
    showToast({ text: 'Script copied' })
  }
  const call = () => showToast({ text: 'Calling is available on your iPhone' })

  return (
    <Page>
      <NavBar
        back="Navigate"
        backTo="/navigate/cases"
        right={
          <button type="button" className="row-5" onClick={() => navigate('/ask')}>
            <MessageSquare size={18} strokeWidth={2} />
            Ask
          </button>
        }
      />
      {c.bill ? <BillHeader c={c} onCall={call} /> : (
        <div className="stack-8" style={{ gap: 6 }}>
          <span className="row-8" style={{ gap: 6 }}>
            <Chip tone={person.tone}>{person.firstName}</Chip>
            <Chip tone="amber" icon={Route}>
              {c.kind}
            </Chip>
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: '31px' }}>{c.title}</h1>
          <span className="row-8">
            <span className="t-sub">{c.source}</span>
            <Chip tone="neutral" size="xs" icon={ImageIcon}>
              <span style={{ color: 'var(--muted)' }}>Source · p.2</span>
            </Chip>
          </span>
        </div>
      )}

      {!c.bill && (
        <Card tint={c.whoHasIt.tone === 'red' ? 'red' : c.whoHasIt.tone === 'amber' ? 'amber' : 'mint'} padding="14px" gap={8}>
          <p className="t-section" style={{ color: `var(--${c.whoHasIt.tone === 'green' ? 'green' : c.whoHasIt.tone})` }}>
            Who has it now
          </p>
          <div className="row-12" style={{ gap: 10 }}>
            <IconTile icon={ShieldCheck} tone="white" size={40} radius={12} iconSize={20} />
            <span className="stack-2">
              <span style={{ fontSize: 16, fontWeight: 600 }}>{c.whoHasIt.title}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: `var(--${c.whoHasIt.tone === 'green' ? 'green' : c.whoHasIt.tone})` }}>{c.whoHasIt.wait}</span>
            </span>
          </div>
          <p style={{ fontSize: 14, lineHeight: '20px' }}>{c.whoHasIt.explainer}</p>
          <span>
            <Chip tone="white" size="xs" icon={BookOpen}>
              <span style={{ color: 'var(--muted)' }}>{c.whoHasIt.sourceChip}</span>
            </Chip>
          </span>
        </Card>
      )}

      {!c.bill && (
        <Card selected gap={10}>
          <p className="t-section" style={{ color: 'var(--green)' }}>
            Your next step
          </p>
          <span className="t-h3">{c.nextAction.headline}</span>
          <NumberedSteps steps={c.nextAction.script} />
          <div className="btn-row">
            <Button size="md" icon={Phone} onClick={call} style={{ fontSize: 14 }}>
              {c.nextAction.primary}
            </Button>
            <Button size="md" variant="outline" icon={Copy} onClick={() => copy(c.nextAction.script)} style={{ fontSize: 14 }}>
              Copy script
            </Button>
          </div>
        </Card>
      )}

      {c.path.length > 0 && (
        <Card gap={0}>
          <p className="t-section">The path</p>
          {c.path.map((s) => (
            <div key={s.label} className="row-12" style={{ paddingTop: 10, alignItems: 'flex-start' }}>
              <span className="icon-tile" style={{ width: 22, height: 22, borderRadius: 11, marginTop: 2, background: s.state === 'done' ? 'var(--green)' : s.state === 'stalled' ? 'var(--red)' : 'transparent', border: s.state === 'todo' ? '1.5px solid var(--line-strong)' : 0, color: '#fff' }}>
                {s.state === 'done' && <Check size={13} strokeWidth={3} />}
                {s.state === 'stalled' && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }} />}
              </span>
              <span className="stack-2">
                <span style={{ fontSize: 15, fontWeight: s.state === 'todo' ? 500 : 600, color: s.state === 'todo' ? 'var(--muted)' : 'var(--ink)' }}>{s.label}</span>
                <span style={{ fontSize: 12, color: s.state === 'stalled' ? 'var(--red)' : 'var(--faint)' }}>{s.by}</span>
              </span>
            </div>
          ))}
        </Card>
      )}

      {c.bill && <BillBody c={c} onCall={call} onCopy={() => copy(c.bill!.ask)} />}

      <Card gap={8}>
        <div className="row-8" style={{ justifyContent: 'space-between' }}>
          <p className="t-section">Call log</p>
          <Button variant="soft" size="sm" icon={Pencil} onClick={() => showToast({ text: 'Call logging is coming next' })} style={{ fontSize: 12, padding: '6px 10px' }}>
            Log a call
          </Button>
        </div>
        {c.callLog.length ? (
          c.callLog.map((l) => (
            <div key={l.meta} className="stack-3" style={{ background: 'var(--bg)', borderRadius: 12, padding: 12 }}>
              <span className="t-small">{l.meta}</span>
              <span style={{ fontSize: 14 }}>{l.text}</span>
            </div>
          ))
        ) : (
          <span className="t-sub">No calls logged yet.</span>
        )}
      </Card>
    </Page>
  )
}

function BillHeader({ c, onCall }: { c: CareCase; onCall: () => void }) {
  const navigate = useNavigate()
  const b = c.bill!
  return (
    <>
      <div className="stack-8">
        <h1 className="t-h2">Bill from Riverside Hospital</h1>
        <span className="row-8" style={{ gap: 6 }}>
          <Chip tone="purple">For Elena</Chip>
          <Chip tone="neutral" icon={Receipt} onClick={() => navigate('/people/elena/documents')}>
            <span style={{ color: 'var(--muted)' }}>Scanned Oct 12</span>
          </Chip>
        </span>
      </div>
      <Card gap={12}>
        <p className="t-section">What this is</p>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: '22px' }}>A bill from the hospital. Elena’s plan hasn’t paid its part yet.</p>
        <div className="btn-row">
          {[
            ['You owe now', b.owe],
            ['Due', b.due],
          ].map(([k, v]) => (
            <span key={k} className="stack-2" style={{ flex: 1, background: 'var(--bg)', borderRadius: 12, padding: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{v}</span>
            </span>
          ))}
        </div>
        <span className="t-sub">{b.service}</span>
        <Button variant="soft" icon={DollarSign} onClick={onCall} style={{ fontSize: 14 }}>
          Can’t pay all at once? See options
        </Button>
      </Card>
      <Card tint="amber" padding="14px" gap={6}>
        <span className="row-8" style={{ color: 'var(--amber)', fontSize: 15, fontWeight: 600 }}>
          <AlertTriangle size={18} strokeWidth={2} />
          Check before you pay
        </span>
        <p style={{ fontSize: 14, lineHeight: '20px' }}>{b.warning}</p>
      </Card>
    </>
  )
}

function BillBody({ c, onCall, onCopy }: { c: CareCase; onCall: () => void; onCopy: () => void }) {
  const { showToast } = useStore()
  const b = c.bill!
  return (
    <>
      <Card pad={false}>
        <p className="t-section" style={{ padding: '14px 16px 4px' }}>
          Who to call
        </p>
        {b.whoToCall.map((w, i) => (
          <div key={w.name} className="list-row" style={{ padding: '12px 16px', borderTop: i ? '1px solid var(--line)' : 0 }}>
            <Avatar initials={String(i + 1)} tone="neutral" size={28} />
            <span className="list-row__body">
              <span className="list-row__title">{w.name}</span>
              <span className="list-row__sub">{w.detail}</span>
            </span>
            <Button size="sm" variant={w.primary ? 'primary' : 'soft'} icon={Phone} onClick={onCall}>
              Call
            </Button>
          </div>
        ))}
      </Card>
      <Card gap={10}>
        <p className="t-section">What to ask</p>
        <NumberedSteps steps={b.ask} />
        <div className="btn-row">
          <Button variant="outline" icon={Copy} onClick={onCopy}>
            Copy script
          </Button>
          <Button variant="outline" icon={Volume2} onClick={() => showToast({ text: 'Read aloud is coming next' })}>
            Read aloud
          </Button>
        </div>
      </Card>
      <div className="btn-row">
        <Button variant="soft" icon={Bell} style={{ fontSize: 14 }} onClick={() => showToast({ text: 'Reminder set for Oct 20' })}>
          Remind me Oct 20
        </Button>
        <Button variant="outline" icon={Pencil} style={{ fontSize: 14 }} onClick={() => showToast({ text: 'Call logging is coming next' })}>
          Log a call
        </Button>
      </div>
    </>
  )
}
