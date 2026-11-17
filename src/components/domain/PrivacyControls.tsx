import { Check, Lock } from 'lucide-react'
import { Avatar, Card, ListRow, Radio, Toggle } from '../ui/primitives'
import type { PrivacySettings } from '../../api'

/**
 * Privacy variant B ("controls") from Experiment 2: the caregiver chooses who
 * sees the documents and whether the photo is kept. Used in first-scan setup
 * and again in Settings → Privacy so the choice can be changed later.
 */
export function PrivacyControls({ value, onChange }: { value: PrivacySettings; onChange: (v: PrivacySettings) => void }) {
  const set = (p: Partial<PrivacySettings>) => onChange({ ...value, ...p })
  return (
    <>
      <section className="stack-8">
        <p className="t-section">Who can see them</p>
        <Card pad={false}>
          <ListRow
            padding="10px 14px"
            medium
            leading={<Avatar initials="A" tone="green" />}
            title="You (Ana)"
            trailing={
              <span className="row-5" style={{ color: 'var(--muted)', fontSize: 14 }}>
                <Lock size={13} strokeWidth={2.2} color="var(--faint)" />
                Always
              </span>
            }
          />
          <ListRow padding="10px 14px" medium leading={<Avatar initials="LP" tone="blue" />} title="Luca" subtitle="In Elena’s circle" trailing={<Toggle label="Share with Luca" checked={value.sharedWithLuca} onChange={(v) => set({ sharedWithLuca: v })} />} />
          <ListRow
            padding="10px 14px"
            medium
            leading={<Avatar initials="+" tone="neutral" />}
            title="People you invite later"
            subtitle="Off until you turn it on"
            trailing={<Toggle label="Share with people you invite later" checked={value.sharedWithFutureInvitees} onChange={(v) => set({ sharedWithFutureInvitees: v })} />}
          />
        </Card>
      </section>

      <section className="stack-8">
        <p className="t-section">After the scan</p>
        <Card pad={false}>
          <ListRow medium leading={<Radio checked={!value.keepPhoto} />} title="Keep only the details" subtitle="The photo is deleted once you review it" onClick={() => set({ keepPhoto: false })} />
          <ListRow medium leading={<Radio checked={value.keepPhoto} />} title="Keep the photo too" subtitle="Handy to show at the next appointment" onClick={() => set({ keepPhoto: true })} />
        </Card>
      </section>

      <Card tint="mint" radius={16} padding="12px 14px" gap={6}>
        <span className="row-5" style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600, gap: 6 }}>
          <Lock size={14} strokeWidth={2.2} />
          Always on
        </span>
        {['Encrypted, start to finish', 'Never shared with your employer or insurer', 'Never used to train AI'].map((s) => (
          <span key={s} className="row-8" style={{ fontSize: 13 }}>
            <Check size={14} strokeWidth={2.4} color="var(--green)" />
            {s}
          </span>
        ))}
      </Card>
    </>
  )
}
