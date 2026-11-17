import { useNavigate } from 'react-router-dom'
import { ChevronDown, Mic, Route, Send, Sparkles } from 'lucide-react'
import { Page } from '../components/layout/layout'
import { Button, Card, Chip, IconTile } from '../components/ui/primitives'

/** 14 — Ask (AI navigator). Coming soon: header and layout match Figma, input is disabled. */
export function Ask() {
  const navigate = useNavigate()
  return (
    <Page>
      <div className="row-8" style={{ justifyContent: 'space-between' }}>
        <h1 className="t-h1">Ask</h1>
        <Chip tone="purple" size="lg">
          About: Elena <ChevronDown size={14} />
        </Chip>
      </div>
      <p className="t-sub">Answers come from Elena’s documents and plan, with sources. It explains and organizes; it doesn’t diagnose.</p>
      <Card gap={10} style={{ alignItems: 'flex-start' }}>
        <IconTile icon={Sparkles} tone="green" size={44} radius={14} iconSize={22} />
        <span className="t-h3">Ask is coming soon</span>
        <span className="t-sub">
          You’ll be able to ask things like “What does this bill mean?” and get an answer grounded in Elena’s own documents, with the page it came from. Until then, every open question lives in a case with a ready-made call script.
        </span>
        <Button variant="soft" icon={Route} onClick={() => navigate('/navigate/cases')}>
          See open cases
        </Button>
      </Card>
      <div className="chip-row" style={{ opacity: 0.5 }}>
        {['What does this bill mean?', 'Is Dr. Patel in network?', 'Explain in Română'].map((q) => (
          <Chip key={q} outline size="lg">
            {q}
          </Chip>
        ))}
      </div>
      <div className="row-8" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: '8px 8px 8px 14px', opacity: 0.6 }} aria-disabled>
        <span style={{ flex: 1, fontSize: 15, color: 'var(--faint)' }}>Coming soon</span>
        <Mic size={20} color="var(--faint)" />
        <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--green)', color: '#fff' }}>
          <Send size={16} />
        </span>
      </div>
    </Page>
  )
}
