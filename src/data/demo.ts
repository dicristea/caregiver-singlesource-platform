/**
 * Demo profiles for Demo Day: Ana (the caregiver) and the two people she
 * cares for, Elena (her mother) and Luca (her son). Content is copied from
 * the Figma prototype so the app matches it screen for screen.
 * There are no real users; nothing here is real health information.
 */
import type { CareCase, Claim, DocRecord, Medication, Person, Reminder } from './types'
import type { PersonId } from '../api/contract'

export const TODAY_LABEL = 'TUESDAY, OCTOBER 13'

export const people: Record<PersonId, Person> = {
  elena: {
    id: 'elena',
    fullName: 'Elena Popescu',
    firstName: 'Elena',
    initials: 'EP',
    tone: 'purple',
    summary: 'Elena · 78 · Medicare',
    extraLine: 'Speaks Romanian',
    allergies: [{ label: 'Penicillin', tone: 'red' }],
    conditions: [{ label: 'Hypothyroidism' }, { label: 'Atrial fibrillation' }, { label: 'Hip replacement · Sep' }],
    facts: [
      { k: 'Next dose', v: 'Apixaban · 8:00 PM' },
      { k: 'Next visit', v: 'Dr. Lee · Thu, Oct 22' },
      { k: 'Insurance', v: 'Medicare Advantage' },
    ],
    insurance: 'Medicare Advantage HMO',
  },
  luca: {
    id: 'luca',
    fullName: 'Luca Popescu',
    firstName: 'Luca',
    initials: 'LP',
    tone: 'blue',
    summary: 'Son · 24 · Dependent on your plan',
    allergies: [{ label: 'Peanuts', tone: 'red' }],
    conditions: [{ label: 'Asthma' }],
    facts: [
      { k: 'Next refill', v: 'Inhaler · Sun, Oct 18' },
      { k: 'Open item', v: 'Claim call · today 2:30' },
      { k: 'Insurance', v: 'Empire Blue Cross' },
    ],
    insurance: 'Empire Blue Cross',
  },
  ana: {
    id: 'ana',
    fullName: 'Ana Popescu',
    firstName: 'Ana',
    initials: 'A',
    tone: 'green',
    summary: 'You · 51 · Plan through work',
    allergies: [{ label: 'No known allergies', tone: 'neutral' }],
    conditions: [{ label: 'Preventive care due', tone: 'amber' }],
    facts: [
      { k: 'Next visit', v: 'Annual physical · Nov 12' },
      { k: 'Open item', v: 'Flu shot · free at CVS' },
      { k: 'Insurance', v: 'Empire Blue Cross (PPO)' },
    ],
    insurance: 'Empire Blue Cross (PPO)',
  },
}

export const circleOrder: PersonId[] = ['elena', 'luca', 'ana']

export const seedReminders: Reminder[] = [
  { id: 'r-levo', personId: 'elena', time: '7:00 AM', minutes: 420, title: 'Levothyroxine 50 mcg', note: 'Take with water', status: 'done', group: 'daily', enabled: true, onToday: true, escalateToLuca: true },
  { id: 'r-apix-am', personId: 'elena', time: '8:00 AM', minutes: 480, title: 'Apixaban 2.5 mg', note: 'With breakfast', status: 'late', group: 'daily', enabled: true, onToday: true },
  { id: 'r-calcium', personId: 'elena', time: '11:00 AM', minutes: 660, title: 'Calcium 600 mg', note: '4 hrs after thyroid pill', status: 'due', group: 'daily', enabled: true, onToday: true },
  { id: 'r-luca-claim', personId: 'luca', time: '2:30 PM', minutes: 870, title: 'Call his plan about the claim', note: 'Ref # A-2291', status: 'due', group: 'task', enabled: true, onToday: true },
  { id: 'r-apix-pm', personId: 'elena', time: '8:00 PM', minutes: 1200, title: 'Apixaban 2.5 mg', note: 'With dinner', status: 'due', group: 'daily', enabled: true, onToday: true },
  { id: 'r-levo-refill', personId: 'elena', time: 'Mon, Oct 19', minutes: 0, title: 'Levothyroxine refill', note: 'CVS · 5 days before she runs out', status: 'due', group: 'refill', enabled: true, onToday: false },
  { id: 'r-call-plan', personId: 'elena', time: 'Tue, Oct 20', minutes: 0, title: "Call Elena's plan", note: 'Ask for the cardiology decision', status: 'due', group: 'visit', enabled: true, onToday: false, caseChip: 'Cardiology case' },
  { id: 'r-dr-lee', personId: 'elena', time: 'Thu, Oct 22', minutes: 0, title: 'Dr. Lee · 10:30 AM', note: '3 questions ready to ask', status: 'due', group: 'visit', enabled: true, onToday: false },
  { id: 'r-bloodwork', personId: 'elena', time: 'Fri, Oct 23', minutes: 0, title: 'Recheck blood work', note: 'From the Oct 6 visit summary', status: 'due', group: 'visit', enabled: true, onToday: false },
  { id: 'r-pt', personId: 'elena', time: 'By Oct 22', minutes: 0, title: 'Book physical therapy', note: 'From the discharge case', status: 'due', group: 'visit', enabled: true, onToday: false },
]

export const seedMedications: Medication[] = [
  {
    id: 'm-levo',
    personId: 'elena',
    name: 'Levothyroxine 50 mcg',
    purpose: 'Thyroid · every day, 7:00 AM',
    rules: [],
    tags: [
      { label: 'Refill in 6 days', tone: 'amber', icon: 'clock' },
      { label: '4 new details to review', tone: 'green', icon: 'sparkle', to: '/scan' },
    ],
  },
  {
    id: 'm-apix',
    personId: 'elena',
    name: 'Apixaban 2.5 mg',
    purpose: 'Blood thinner · 8:00 AM and 8:00 PM',
    rules: ["Don't skip doses", 'Call the doctor about unusual bleeding'],
    tags: [{ label: 'Price jumped $25 → $340', tone: 'red', icon: 'alert' }],
  },
  {
    id: 'm-calcium',
    personId: 'elena',
    name: 'Calcium 600 mg',
    purpose: 'Supplement · 11:00 AM',
    rules: ['4 hours apart from the thyroid pill'],
    tags: [],
  },
]

export const seedDocuments: DocRecord[] = [
  { id: 'd-bill', personId: 'elena', kind: 'Bill', title: 'Riverside Hospital bill', meta: 'Bill · Oct 12 · by Ana', outcome: '$412.60 · case opened', outcomeTone: 'green', month: 'OCTOBER', to: '/navigate/cases/riverside-bill' },
  { id: 'd-eob', personId: 'elena', kind: 'EOB', title: 'Explanation of benefits', meta: 'EOB · Oct 10 · by Luca', outcome: 'Costs this year now $1,240', outcomeTone: 'green', month: 'OCTOBER', to: '/navigate' },
  { id: 'd-visit', personId: 'elena', kind: 'Visit', title: 'Dr. Lee visit summary', meta: 'Visit summary · Oct 6 · by Ana', outcome: '3 next steps · 1 case', outcomeTone: 'green', month: 'OCTOBER', to: '/navigate/cases/cardiology' },
  { id: 'd-card', personId: 'elena', kind: 'Card', title: 'Insurance card, front and back', meta: 'Insurance · Oct 2 · by Ana', outcome: 'Plan card filled in', outcomeTone: 'green', month: 'OCTOBER', to: '/navigate' },
  { id: 'd-discharge', personId: 'elena', kind: 'Dc', title: 'Hip surgery discharge sheet', meta: 'Discharge · Sep 18 · by Ana', outcome: '1 detail left to review', outcomeTone: 'amber', month: 'SEPTEMBER', to: '/navigate/cases/pt' },
]

const billWhoToCall = [
  { name: "Elena's plan · member services", detail: 'Number on her card. Ask about the claim.', primary: true },
  { name: 'Riverside Hospital billing', detail: 'Only if the claim is still pending Oct 20', primary: false },
]

export const seedCases: CareCase[] = [
  {
    id: 'cardiology',
    personId: 'elena',
    kind: 'Referral',
    title: 'Cardiology referral',
    status: { label: 'Stalled · day 9', tone: 'red' },
    holder: "Elena's plan (prior authorization)",
    progress: 0.3,
    progressTone: 'red',
    nextStep: 'Call the plan today. Script is ready.',
    source: "From Dr. Lee's visit summary, Oct 6",
    whoHasIt: {
      title: "Elena's plan · prior authorization",
      wait: 'Waiting 9 days',
      explainer: 'Medicare Advantage plans must decide standard requests within 7 days. This one is late.',
      sourceChip: 'Source · CMS prior authorization rule',
      tone: 'red',
    },
    nextAction: {
      headline: "Call Elena's plan and ask for the decision.",
      script: ['Has the cardiology request been decided?', "It's past 7 days. Can you escalate it?", "What's the reference number?"],
      primary: 'Call plan',
    },
    path: [
      { label: 'Referral sent', by: "Dr. Lee's office · Oct 6", state: 'done' },
      { label: 'Prior authorization', by: "Elena's plan · stalled", state: 'stalled' },
      { label: 'Book cardiologist', by: 'You', state: 'todo' },
      { label: 'Visit', by: 'Dr. Patel', state: 'todo' },
      { label: 'Results back to Dr. Lee', by: "Dr. Patel's office", state: 'todo' },
    ],
    callLog: [{ meta: "Oct 12 · Elena's plan · Ana", text: '"Pending clinical review." Ref # PA-55821' }],
  },
  {
    id: 'riverside-bill',
    personId: 'elena',
    kind: 'Bill',
    title: 'Riverside Hospital bill · $412.60',
    status: { label: 'Wait to pay', tone: 'amber' },
    holder: "Elena's plan (claim pending)",
    progress: 0.45,
    progressTone: 'amber',
    nextStep: 'Check the claim before paying · due Oct 24',
    source: 'Scanned Oct 12',
    whoHasIt: { title: "Elena's plan · claim", wait: 'Claim pending', explainer: 'The bill lists insurance as pending.', sourceChip: 'Source · Riverside bill p.1', tone: 'amber' },
    nextAction: { headline: 'Check the claim before you pay.', script: ['Has this claim been sent to her plan?', 'What is the claim reference number?', 'Can you hold the bill while it is processed?'], primary: 'Call' },
    path: [],
    callLog: [],
    bill: {
      owe: '$412.60',
      due: 'Oct 24',
      service: 'Service on Sep 18 · follow-up after hip surgery',
      warning: 'The bill lists insurance as pending. Paying now could mean paying twice.',
      whoToCall: billWhoToCall,
      ask: ['Has this claim been sent to her plan?', 'What is the claim reference number?', 'Can you hold the bill while it is processed?'],
    },
  },
  {
    id: 'pt',
    personId: 'elena',
    kind: 'Discharge',
    title: 'Physical therapy after hip surgery',
    status: { label: 'Your move', tone: 'green' },
    holder: 'You (book the first visit)',
    progress: 0.2,
    progressTone: 'green',
    nextStep: 'Book by Oct 22 · 3 in-network options',
    source: 'From the hip surgery discharge sheet, Sep 18',
    whoHasIt: { title: 'You · book the first visit', wait: 'Due by Oct 22', explainer: 'The discharge sheet asks for physical therapy within 5 weeks of surgery.', sourceChip: 'Source · discharge sheet p.2', tone: 'green' },
    nextAction: { headline: 'Book the first physical therapy visit.', script: ['Are you in network for Medicare Advantage HMO?', 'Do you have a first visit before Oct 22?', 'Do you need the referral faxed from Dr. Lee?'], primary: 'Call clinic' },
    path: [
      { label: 'Discharged after hip surgery', by: 'Riverside Hospital · Sep 18', state: 'done' },
      { label: 'Book first PT visit', by: 'You', state: 'todo' },
      { label: 'Twice-weekly sessions', by: 'PT clinic', state: 'todo' },
    ],
    callLog: [],
  },
  {
    id: 'luca-denial',
    personId: 'luca',
    kind: 'Denial',
    title: 'Therapy claim denied',
    status: { label: 'Appeal by Nov 2', tone: 'red' },
    holder: "Luca's plan",
    progress: 0.6,
    progressTone: 'red',
    nextStep: 'Send the appeal letter we drafted',
    source: 'From the EOB scanned by Luca, Oct 10',
    whoHasIt: { title: "Luca's plan · appeal window", wait: 'Appeal by Nov 2', explainer: 'Denied as out of network. An appeal letter is drafted and ready to send.', sourceChip: 'Source · EOB p.1', tone: 'red' },
    nextAction: { headline: 'Send the appeal letter.', script: ['Confirm the appeal mailing address', 'Ask for written confirmation it was received', 'Note the appeal reference number'], primary: 'Call plan' },
    path: [
      { label: 'Claim submitted', by: 'Therapist · Sep 2', state: 'done' },
      { label: 'Denied', by: "Luca's plan · Oct 8", state: 'done' },
      { label: 'Send appeal', by: 'You', state: 'todo' },
      { label: 'Decision', by: "Luca's plan", state: 'todo' },
    ],
    callLog: [{ meta: 'Oct 13 · Luca · Ana', text: 'Ref # A-2291' }],
  },
]

export const seedClaims: Claim[] = [
  { id: 'c1', title: 'Riverside Hospital · follow-up', meta: 'Sep 18 · billed $412.60', status: { label: 'Pending', tone: 'amber' }, to: '/navigate/cases/riverside-bill' },
  { id: 'c2', title: 'Dr. Lee · visit', meta: 'Oct 6 · you owe $0', status: { label: 'Paid', tone: 'green' } },
  { id: 'c3', title: 'Cardiology prior auth', meta: 'Requested Oct 6 · day 9', status: { label: 'Stalled', tone: 'red' }, to: '/navigate/cases/cardiology' },
]

export const careTeam = [
  { initials: 'DL', tone: 'green' as const, name: 'Dr. Lee', badge: 'Quarterback', role: 'Primary care · coordinates her care' },
  { initials: 'DP', tone: 'amber' as const, name: 'Dr. Patel', role: 'Cardiology · referral pending' },
  { initials: 'RH', tone: 'teal' as const, name: 'Riverside Hospital', role: 'Hip surgery · Sep 18' },
  { initials: 'CV', tone: 'neutral' as const, name: 'CVS Pharmacy', role: '2nd Ave · all refills' },
]
