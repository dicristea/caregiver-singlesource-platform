import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { Page } from '../components/layout/layout'
import { PersonCard, PersonTag } from '../components/domain/domain'
import { Button, Card, IconTile, ListRow, ScreenHeader, SegmentedControl } from '../components/ui/primitives'
import { circleOrder, people } from '../data/demo'
import { useStore } from '../state/AppStore'

/** 02 — Your Circle: everyone Ana cares for. */
export function Circle() {
  const navigate = useNavigate()
  const { showToast, reminders } = useStore()
  const [tab, setTab] = useState<'people' | 'todos'>('people')
  const todos = reminders.filter((r) => r.status !== 'done' && r.onToday)

  return (
    <Page gap={16}>
      <ScreenHeader title="Your Circle" subtitle="You and 2 people you care for · Luca helps" />
      <SegmentedControl
        large
        value={tab}
        onChange={setTab}
        options={[
          { value: 'people', label: 'People' },
          { value: 'todos', label: 'Shared to-dos' },
        ]}
      />
      {tab === 'people' ? (
        <>
          <Card radius={16} pad={false} onClick={() => setTab('todos')}>
            <ListRow leading={<IconTile icon={Check} tone="red" size={36} radius={10} iconSize={18} />} title="6 shared to-dos · 1 overdue" subtitle="Luca has the 8 PM dose tonight" chevron padding="12px 14px" />
          </Card>
          {circleOrder.map((id) => (
            <PersonCard key={id} person={people[id]} onOpen={() => navigate(`/people/${id}`)} onToast={(text) => showToast({ text })} />
          ))}
          <Button variant="outline" size="lg" icon={Plus} full style={{ fontSize: 14, borderStyle: 'dashed', borderColor: 'var(--line-strong)', background: 'transparent' }} onClick={() => showToast({ text: 'Inviting people is coming next' })}>
            Add someone you care for
          </Button>
        </>
      ) : (
        <Card pad={false}>
          {todos.map((r) => (
            <ListRow key={r.id} title={r.title} subtitle={`${r.time} · ${r.note}`} leading={<PersonTag id={r.personId} />} alignTop />
          ))}
        </Card>
      )}
    </Page>
  )
}
