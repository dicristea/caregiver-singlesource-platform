import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, Download, Globe, Mic, Moon, RotateCcw, ShieldCheck, Trash2, Type, User, Volume2 } from 'lucide-react'
import { NavBar, Page } from '../components/layout/layout'
import { SettingsGroup } from '../components/domain/domain'
import { PrivacyControls } from '../components/domain/PrivacyControls'
import { Avatar, Button, Card, Chip, IconTile, ListRow, Toggle } from '../components/ui/primitives'
import { useStore } from '../state/AppStore'
import { pushSupport, requestPushPermission, showSystemNotification } from '../lib/notify'
import type { NotificationPrefs, ReminderChannel } from '../api'
import { api } from '../api'

/** 09 — Settings. Language rows are shown but not functional (out of scope). */
export function Settings() {
  const navigate = useNavigate()
  const { showToast, notif, privacy, resetDemo } = useStore()
  const notYet = () => showToast({ text: 'Language settings are coming later' })
  const channels = [notif.push && 'Push', notif.text && 'Text', notif.email && 'Email', notif.inApp && 'In app'].filter(Boolean).join(', ') || 'Off'

  return (
    <Page>
      <NavBar back="Today" backTo="/" />
      <h1 className="t-h1">Settings</h1>
      <Card gap={12}>
        <div className="row-12">
          <Avatar initials="A" tone="green" size={52} />
          <span className="stack-3">
            <span style={{ fontSize: 18, fontWeight: 700 }}>Ana Popescu</span>
            <span className="t-sub">Main caregiver for Elena and Luca</span>
          </span>
        </div>
        <span>
          <Chip tone="green" icon={ShieldCheck}>
            Free through your employer
          </Chip>
        </span>
      </Card>

      <SettingsGroup label="Language">
        <ListRow medium leading={<IconTile icon={Globe} tone="green" size={32} radius={9} iconSize={16} />} title="App language" subtitle="Menus and reminders" value="English" chevron onClick={notYet} />
        <ListRow medium leading={<IconTile icon={User} tone="purple" size={32} radius={9} iconSize={16} />} title="Elena’s details" subtitle="Snapshot and scanned details" value="Română" chevron onClick={notYet} />
        <ListRow medium leading={<IconTile icon={User} tone="blue" size={32} radius={9} iconSize={16} />} title="Luca’s details" value="English" chevron onClick={notYet} />
        <ListRow medium leading={<IconTile icon={Volume2} tone="neutral" size={32} radius={9} iconSize={16} />} title="Read details aloud" trailing={<Toggle label="Read details aloud" checked onChange={notYet} />} />
      </SettingsGroup>

      <SettingsGroup label="Display">
        <ListRow medium leading={<IconTile icon={Type} tone="neutral" size={32} radius={9} iconSize={16} />} title="Text size" value="Large" chevron onClick={() => showToast({ text: 'Uses your iPhone’s text size' })} />
      </SettingsGroup>

      <SettingsGroup label="Reminders">
        <ListRow medium leading={<IconTile icon={BellRing} tone="green" size={32} radius={9} iconSize={16} />} title="How reminders reach you" subtitle={channels} chevron onClick={() => navigate('/settings/notifications')} />
        <ListRow medium leading={<IconTile icon={Moon} tone="neutral" size={32} radius={9} iconSize={16} />} title="Quiet hours" value="10 PM–7 AM" chevron onClick={() => showToast({ text: 'Quiet hours are set by the backend scheduler' })} />
        <ListRow medium leading={<IconTile icon={Bell} tone="neutral" size={32} radius={9} iconSize={16} />} title="If a dose is missed" subtitle="Alert Luca after 30 min" chevron onClick={() => navigate('/people/elena/reminders')} />
      </SettingsGroup>

      <SettingsGroup label="Privacy">
        <ListRow medium leading={<IconTile icon={ShieldCheck} tone="green" size={32} radius={9} iconSize={16} />} title="Who sees documents" subtitle={`${privacy.sharedWithLuca ? 'You and Luca' : 'Only you'} · ${privacy.keepPhoto ? 'photos kept' : 'photos deleted after review'}`} chevron onClick={() => navigate('/settings/privacy')} />
        <ListRow medium leading={<IconTile icon={Mic} tone="neutral" size={32} radius={9} iconSize={16} />} title="Delete visit audio after summary" trailing={<Toggle label="Delete visit audio after summary" checked onChange={() => undefined} />} />
        <ListRow medium leading={<IconTile icon={Download} tone="neutral" size={32} radius={9} iconSize={16} />} title="Export my data" chevron onClick={() => showToast({ text: 'Export needs the backend' })} />
        <ListRow medium leading={<IconTile icon={Trash2} tone="red" size={32} radius={9} iconSize={16} />} title="Delete account" titleColor="var(--red)" onClick={() => showToast({ text: 'Account deletion needs the backend' })} />
      </SettingsGroup>

      <SettingsGroup label="Demo">
        <ListRow
          medium
          leading={<IconTile icon={RotateCcw} tone="amber" size={32} radius={9} iconSize={16} />}
          title="Reset demo"
          subtitle="Start the Ana / Elena / Luca story over"
          onClick={() => {
            resetDemo()
            showToast({ text: 'Demo reset' })
            navigate('/')
          }}
        />
      </SettingsGroup>
    </Page>
  )
}

/** Settings → Privacy: the same controls as the first-scan screen (variant B). */
export function PrivacySettingsScreen() {
  const { privacy, savePrivacy, showToast } = useStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(privacy)
  return (
    <Page
      tabs={false}
      gap={12}
      footer={
        <Button
          size="lg"
          full
          onClick={async () => {
            await savePrivacy({ ...draft, configured: true })
            showToast({ text: 'Privacy settings saved' })
            navigate(-1)
          }}
        >
          Save
        </Button>
      }
    >
      <NavBar back="Back" title="Privacy" />
      <h1 className="t-h1">Who sees Elena’s documents</h1>
      <PrivacyControls value={draft} onChange={setDraft} />
      <div style={{ height: 70 }} />
    </Page>
  )
}

/** Settings → How reminders reach you. Push is the default; text, email and in-app are options. */
export function NotificationSettings() {
  const { notif, saveNotif, showToast, showPush } = useStore()
  const [draft, setDraft] = useState<NotificationPrefs>(notif)
  const [perm, setPerm] = useState(pushSupport())
  const set = (p: Partial<NotificationPrefs>) => {
    const next = { ...draft, ...p }
    setDraft(next)
    void saveNotif(next)
  }

  const enablePush = async (on: boolean) => {
    if (on && perm !== 'granted') setPerm(await requestPushPermission())
    set({ push: on })
  }

  const test = async () => {
    const chosen = (['push', 'text', 'email', 'inApp'] as ReminderChannel[]).filter((c) => draft[c])
    const res = await api.sendTestReminder(chosen)
    const title = 'Elena · Levothyroxine 50 mcg'
    const body = 'Empty stomach. No coffee until 7:45.'
    if (res.sent.includes('push')) await showSystemNotification(title, body)
    if (res.sent.includes('inApp') || res.sent.includes('push')) showPush({ title, body })
    if (res.notes.length) window.setTimeout(() => showToast({ text: res.notes[0] }), 600)
  }

  const pushNote =
    perm === 'unsupported'
      ? 'On iPhone: Share → Add to Home Screen, then open CareCircle from there to allow notifications.'
      : perm === 'denied'
        ? 'Notifications are blocked. Turn them on in iPhone Settings → CareCircle.'
        : perm === 'granted'
          ? 'Allowed on this phone.'
          : 'You’ll be asked to allow notifications.'

  return (
    <Page tabs={false}>
      <NavBar back="Settings" backTo="/settings" />
      <h1 className="t-h1">How reminders reach you</h1>
      <p className="t-body t-muted">Pick one or more. CareCircle uses all of them for the 7:00 AM thyroid dose and anything that needs you today.</p>
      <Card pad={false}>
        <ListRow medium title="Push notifications" subtitle={pushNote} trailing={<Toggle label="Push notifications" checked={draft.push} onChange={enablePush} />} alignTop />
        <ListRow medium title="Text message" subtitle={draft.text ? draft.phone || 'Add your mobile number below' : 'Good backup if notifications are off'} trailing={<Toggle label="Text message" checked={draft.text} onChange={(v) => set({ text: v })} />} />
        {draft.text && (
          <div className="list-row">
            <input type="tel" inputMode="tel" placeholder="(555) 010-2030" aria-label="Mobile number" value={draft.phone ?? ''} onChange={(e) => set({ phone: e.target.value })} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 15 }} />
          </div>
        )}
        <ListRow medium title="Email" subtitle={draft.email ? draft.emailAddress || 'Add your email below' : 'A daily summary and anything urgent'} trailing={<Toggle label="Email" checked={draft.email} onChange={(v) => set({ email: v })} />} />
        {draft.email && (
          <div className="list-row">
            <input type="email" placeholder="ana@example.com" aria-label="Email address" value={draft.emailAddress ?? ''} onChange={(e) => set({ emailAddress: e.target.value })} style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 10, padding: '10px 12px', fontSize: 15 }} />
          </div>
        )}
        <ListRow medium title="In the app only" subtitle="A banner while CareCircle is open" trailing={<Toggle label="In the app" checked={draft.inApp} onChange={(v) => set({ inApp: v })} />} />
      </Card>
      <Button variant="soft" size="lg" icon={BellRing} full onClick={test}>
        Send a test reminder
      </Button>
      <p className="t-small">Text and email are sent by the backend once it is connected. Push works today when CareCircle is on your Home Screen.</p>
    </Page>
  )
}
