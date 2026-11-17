import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { NavBar, Page } from '../../components/layout/layout'
import { PrivacyControls } from '../../components/domain/PrivacyControls'
import { Button, IconTile } from '../../components/ui/primitives'
import { useStore } from '../../state/AppStore'

/** B1 — Privacy controls before the first scan (Experiment 2, variant B). */
export function PrivacySetup() {
  const { privacy, savePrivacy } = useStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(privacy)

  const save = async () => {
    await savePrivacy({ ...draft, configured: true })
    navigate('/scan/choose', { replace: true })
  }

  return (
    <Page tabs={false} gap={12} footer={<Button size="lg" full onClick={save}>Save and continue</Button>}>
      <NavBar back="Cancel" muted title="Before you scan" backTo="/" />
      <div className="stack-8" style={{ paddingTop: 4 }}>
        <IconTile icon={ShieldCheck} tone="solidGreen" size={48} radius={14} iconSize={26} />
        <h1 className="t-h1">You decide who sees Elena’s documents</h1>
        <p className="t-body t-muted">Set it once. Change it anytime in Settings.</p>
      </div>
      <PrivacyControls value={draft} onChange={setDraft} />
      <div style={{ height: 70 }} />
    </Page>
  )
}
