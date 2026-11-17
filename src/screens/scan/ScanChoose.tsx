import { useNavigate } from 'react-router-dom'
import { Camera, FileText, Lock } from 'lucide-react'
import { NavBar, Page } from '../../components/layout/layout'
import { OptionCard } from '../../components/domain/domain'
import { Avatar } from '../../components/ui/primitives'
import { useStore } from '../../state/AppStore'

/**
 * B2 — Real document or sample? Both options are styled identically on
 * purpose (Experiment 2 measures which one caregivers pick).
 */
export function ScanChoose() {
  const navigate = useNavigate()
  const { privacy, track } = useStore()
  const footer = [privacy.sharedWithLuca ? 'You and Luca' : 'Only you', privacy.keepPhoto ? 'photo kept' : 'photo deleted after review'].join(' · ')

  const pick = (choice: 'real' | 'sample') => {
    track('upload_choice', { choice })
    navigate(`/scan/camera?mode=${choice}`)
  }

  return (
    <Page
      tabs={false}
      footer={
        <span className="row-8" style={{ justifyContent: 'center', fontSize: 12, color: 'var(--muted)', gap: 6, marginBottom: -10 }}>
          <Lock size={13} strokeWidth={2.2} color="var(--faint)" />
          {footer}
          <button type="button" style={{ color: 'var(--green)', fontWeight: 600 }} onClick={() => navigate('/settings/privacy')}>
            Edit
          </button>
        </span>
      }
    >
      <NavBar back="Back" title="Scan for Elena" />
      <div className="stack-10" style={{ padding: '4px 0' }}>
        <span className="row-8" style={{ alignSelf: 'flex-start', padding: '3px 12px 3px 4px', borderRadius: 999, background: 'var(--lavender)', border: '1.5px solid var(--purple)', color: 'var(--purple)', fontSize: 14, fontWeight: 600, gap: 6 }}>
          <Avatar initials="EP" tone="white" size={24} />
          For Elena
        </span>
        <h1 className="t-h1">What would you like to scan?</h1>
        <p className="t-body t-muted">Use one of Elena’s real documents, or try CareCircle with a sample first.</p>
      </div>
      <OptionCard variant="white" icon={Camera} tileTone="green" title="Scan Elena’s document" subtitle="Discharge sheet, pharmacy handout, bill or visit summary" onClick={() => pick('real')} />
      <OptionCard variant="white" icon={FileText} tileTone="green" title="Try a sample document" subtitle="A sample pharmacy handout, so you can see how it works first" onClick={() => pick('sample')} />
      <p className="t-sub" style={{ textAlign: 'center' }}>
        Both take about a minute. Nothing is saved until you review it.
      </p>
    </Page>
  )
}
