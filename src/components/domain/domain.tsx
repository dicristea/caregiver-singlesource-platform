import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, ChevronRight, Clock, ExternalLink, Flag, Image, Phone, Pin, Pill, Share, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, Button, Card, Chip, IconTile, KeyValue, Progress } from '../ui/primitives'
import type { Tone } from '../ui/tone'
import { people } from '../../data/demo'
import type { CareCase, DocRecord, Medication, Person, Reminder } from '../../data/types'
import type { PersonId } from '../../api'
import './domain.css'

/* ------------------------------------------------------------------ */
/* PersonTag — colored dot + first name (Elena purple, Luca blue)         */
/* ------------------------------------------------------------------ */
const personColor: Record<PersonId, string> = { elena: 'var(--purple)', luca: 'var(--blue)', ana: 'var(--green)' }
export function PersonTag({ id, suffix }: { id: PersonId; suffix?: string }) {
  return (
    <span className="person-tag" style={{ color: personColor[id] }}>
      <span className="person-tag__dot" style={{ background: personColor[id] }} />
      {people[id].firstName}
      {suffix && ` · ${suffix}`}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* AlertCard — tinted "Needs attention" card on Today                    */
/* ------------------------------------------------------------------ */
export function AlertCard({ tint, icon: Icon, iconColor, title, subtitle, actions, onClick }: { tint: 'red' | 'mint' | 'amber'; icon: LucideIcon; iconColor: string; title: string; subtitle: string; actions?: ReactNode; onClick?: () => void }) {
  return (
    <Card tint={tint} radius={18} padding="14px" gap={12} onClick={actions ? undefined : onClick}>
      <div className="row-12" onClick={actions ? onClick : undefined} role={actions && onClick ? 'button' : undefined}>
        <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', color: iconColor }}>
          <Icon size={18} strokeWidth={2} />
        </span>
        <div className="stack-2" style={{ flex: 1 }}>
          <span className="t-title">{title}</span>
          <span className="t-sub">{subtitle}</span>
        </div>
      </div>
      {actions && <div className="row-8" style={{ paddingLeft: 48 }}>{actions}</div>}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* ReminderRow — a row in Today's timeline                               */
/* ------------------------------------------------------------------ */
export function ReminderRow({ reminder, onToggle }: { reminder: Reminder; onToggle: () => void }) {
  const done = reminder.status === 'done'
  const late = reminder.status === 'late'
  return (
    <div className="reminder-row">
      <span className="reminder-row__time" style={{ color: late ? 'var(--red)' : 'var(--muted)' }}>
        {reminder.time}
      </span>
      <div className="stack-2" style={{ flex: 1, minWidth: 0 }}>
        <PersonTag id={reminder.personId} />
        <span className="t-title" style={{ color: done ? 'var(--muted)' : 'var(--ink)' }}>
          {reminder.title}
        </span>
        <span className="t-sub">{reminder.note}</span>
      </div>
      <button type="button" className={`status-dot${done ? ' status-dot--done' : ''}${late ? ' status-dot--late' : ''}`} aria-label={done ? `Mark ${reminder.title} not done` : `Mark ${reminder.title} done`} aria-pressed={done} onClick={onToggle}>
        {done && <Check size={16} strokeWidth={2.6} />}
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* PersonCard — Circle tab                                               */
/* ------------------------------------------------------------------ */
export function PersonCard({ person, onOpen, onToast }: { person: Person; onOpen: () => void; onToast: (t: string) => void }) {
  return (
    <Card shadow gap={14}>
      <button type="button" className="row-12" onClick={onOpen} style={{ width: '100%' }}>
        <Avatar initials={person.initials} tone={person.tone} size={52} />
        <span className="stack-2" style={{ flex: 1 }}>
          <span style={{ fontSize: 19, fontWeight: 700 }}>
            {person.fullName}
            {person.id === 'ana' && ' (you)'}
          </span>
          <span className="t-sub">{person.summary}</span>
        </span>
        <ChevronRight size={20} strokeWidth={1.7} color="var(--faint)" />
      </button>
      <div className="chip-row">
        {person.allergies.map((a) => (
          <Chip key={a.label} tone={a.tone} icon={AlertTriangle}>
            <span style={a.tone === 'neutral' ? { color: 'var(--muted)' } : undefined}>{a.label}</span>
          </Chip>
        ))}
        {person.conditions.map((c) => (
          <Chip key={c.label} tone={c.tone ?? 'neutral'}>
            {c.label}
          </Chip>
        ))}
      </div>
      <div className="stack-8">
        {person.facts.map((f) => (
          <KeyValue key={f.k} k={f.k} v={f.v} />
        ))}
      </div>
      <div className="btn-row">
        <Button variant="soft" size="md" icon={Phone} onClick={() => onToast('Calling is available on your iPhone')}>
          Call PCP
        </Button>
        <Button variant="soft" size="md" icon={ExternalLink} onClick={() => onToast('Portal links open the saved login')}>
          Portal
        </Button>
        <Button variant="soft" size="md" icon={Share} onClick={() => onToast('Snapshot sharing is coming next')}>
          Snapshot
        </Button>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* PersonHeader + tabs — Elena's detail pages                            */
/* ------------------------------------------------------------------ */
export function PersonHeader({ person }: { person: Person }) {
  return (
    <div className="row-14" style={{ alignItems: 'flex-start' }}>
      <Avatar initials={person.initials} tone={person.tone} size={64} />
      <div className="stack-3" style={{ flex: 1 }}>
        <h1 className="t-h2">{person.fullName}</h1>
        <span style={{ fontSize: 14, lineHeight: '19px', color: 'var(--muted)' }}>
          {person.summary}
          {person.extraLine && (
            <>
              <br />
              {person.extraLine}
            </>
          )}
        </span>
        {person.id === 'elena' && (
          <span style={{ marginTop: 4 }}>
            <Chip tone="green" icon={Check}>
              Proxy form on file
            </Chip>
          </span>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MedCard                                                               */
/* ------------------------------------------------------------------ */
const tagIcons = { clock: Clock, image: Image, alert: AlertTriangle, sparkle: Sparkles }
export function MedCard({ med }: { med: Medication }) {
  const navigate = useNavigate()
  return (
    <Card shadow gap={12}>
      <div className="row-12">
        <IconTile icon={Pill} tone="purple" size={40} radius={12} iconSize={20} />
        <div className="stack-2" style={{ flex: 1 }}>
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: '21px' }}>{med.name}</span>
          <span className="t-sub">{med.purpose}</span>
        </div>
        <ChevronRight size={20} strokeWidth={1.7} color="var(--faint)" />
      </div>
      {med.rules.length > 0 && (
        <div className="pinned">
          <span className="t-section">Pinned rules</span>
          {med.rules.map((r) => (
            <span key={r} className="pinned__rule">
              <Pin size={14} strokeWidth={2} color="var(--green)" />
              {r}
            </span>
          ))}
        </div>
      )}
      {med.tags.length > 0 && (
        <div className="chip-row">
          {med.tags.map((t) => (
            <Chip key={t.label} tone={t.tone} icon={t.icon ? tagIcons[t.icon] : undefined} onClick={t.to ? () => navigate(t.to!) : undefined}>
              <span style={t.tone === 'neutral' ? { color: 'var(--muted)' } : undefined}>{t.label}</span>
            </Chip>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* CaseCard — Navigate · Open cases                                     */
/* ------------------------------------------------------------------ */
export function CaseCard({ c, onOpen }: { c: CareCase; onOpen: () => void }) {
  return (
    <Card shadow gap={10} onClick={onOpen}>
      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <PersonTag id={c.personId} suffix={c.kind} />
        <Chip tone={c.status.tone} size="sm">
          {c.status.label}
        </Chip>
      </div>
      <span style={{ fontSize: 17, fontWeight: 700 }}>{c.title}</span>
      <div className="row-8">
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', width: 70 }}>Has it now</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{c.holder}</span>
      </div>
      <Progress value={c.progress} tone={c.progressTone} thin />
      <span className="row-8" style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)' }}>
        <Flag size={16} strokeWidth={2} />
        {c.nextStep}
      </span>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* DocRow + DocThumb — Documents list                                    */
/* ------------------------------------------------------------------ */
const docTone: Record<DocRecord['kind'], Tone> = { Rx: 'purple', Bill: 'amber', EOB: 'amber', Visit: 'green', Card: 'teal', Dc: 'red' }
export function DocThumb({ kind }: { kind: DocRecord['kind'] }) {
  const tone = docTone[kind]
  const colors: Record<Tone, [string, string]> = {
    purple: ['var(--lavender)', 'var(--purple)'],
    amber: ['var(--amber-bg)', 'var(--amber)'],
    green: ['var(--mint)', 'var(--green)'],
    teal: ['var(--teal-bg)', 'var(--teal)'],
    red: ['var(--red-bg)', 'var(--red)'],
    blue: ['var(--blue-bg)', 'var(--blue)'],
    neutral: ['var(--sand)', 'var(--ink)'],
    white: ['#fff', 'var(--ink)'],
    dark: ['var(--ink)', '#fff'],
    solidGreen: ['var(--green)', '#fff'],
  }
  const [bg, fg] = colors[tone]
  return (
    <span className="doc-thumb" aria-hidden>
      <span className="doc-thumb__band" style={{ background: bg, color: fg }}>
        {kind}
      </span>
      <span className="doc-thumb__line" style={{ width: 26 }} />
      <span className="doc-thumb__line" style={{ width: 22 }} />
      <span className="doc-thumb__line" style={{ width: 28 }} />
      <span className="doc-thumb__line" style={{ width: 18 }} />
    </span>
  )
}
export function DocRow({ doc, onOpen }: { doc: DocRecord; onOpen: () => void }) {
  const amber = doc.outcomeTone === 'amber'
  return (
    <button type="button" className="list-row" onClick={onOpen}>
      <DocThumb kind={doc.kind} />
      <span className="list-row__body" style={{ gap: 4 }}>
        <span className="list-row__title">{doc.title}</span>
        <span className="t-small">{doc.meta}</span>
        <span className="row-5" style={{ fontSize: 12, fontWeight: 500, color: amber ? 'var(--amber)' : 'var(--green)' }}>
          {amber ? <AlertTriangle size={13} strokeWidth={2.2} /> : <Sparkles size={13} strokeWidth={2.2} />}
          {doc.outcome}
        </span>
      </span>
      <ChevronRight size={20} strokeWidth={1.7} className="list-row__chev" />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* OptionCard — big tappable row (Add sheet, real-or-sample choice)      */
/* ------------------------------------------------------------------ */
export function OptionCard({ icon, tileTone, title, subtitle, onClick, variant = 'sand', solidTile }: { icon: LucideIcon; tileTone: Tone; title: string; subtitle: string; onClick: () => void; variant?: 'sand' | 'white'; solidTile?: string }) {
  const Icon = icon
  return (
    <button type="button" className={`option-card option-card--${variant}`} onClick={onClick}>
      {solidTile ? (
        <span className="icon-tile" style={{ width: 52, height: 52, borderRadius: 16, background: solidTile, color: '#fff' }}>
          <Icon size={24} strokeWidth={2} />
        </span>
      ) : (
        <IconTile icon={icon} tone={tileTone} size={52} radius={16} iconSize={24} />
      )}
      <span className="stack-3" style={{ flex: 1 }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{title}</span>
        <span className="t-sub">{subtitle}</span>
      </span>
      <ChevronRight size={20} strokeWidth={1.7} color="var(--faint)" />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* SettingsGroup — section label + rows card                             */
/* ------------------------------------------------------------------ */
export function SettingsGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="stack-8">
      <p className="t-section">{label}</p>
      <Card pad={false}>{children}</Card>
    </section>
  )
}
