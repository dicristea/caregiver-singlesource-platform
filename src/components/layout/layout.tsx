import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck, ChevronLeft, Compass, MessageSquare, Plus, Users } from 'lucide-react'
import { useStore } from '../../state/AppStore'

/* ------------------------------------------------------------------ */
/* StatusBar — only visible inside the desktop phone frame               */
/* ------------------------------------------------------------------ */
export function StatusBar() {
  return (
    <div className="status-bar--fake" aria-hidden>
      <span className="status-bar__time">9:41</span>
      <svg width="57" height="12" viewBox="0 0 57 12" fill="currentColor">
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5" width="3" height="7" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
        <rect x="32.5" y="0.5" width="24" height="11" rx="3.5" fill="none" stroke="currentColor" />
        <rect x="35" y="2" width="19" height="8" rx="2" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page — every screen renders inside one                                */
/* ------------------------------------------------------------------ */
export function Page({ children, tabs = true, dark, gap, footer, overlay }: { children: ReactNode; tabs?: boolean; dark?: boolean; gap?: number; footer?: ReactNode; overlay?: ReactNode }) {
  return (
    <div className={`page${tabs ? ' page--tabs' : ''}${dark ? ' page--dark' : ''}`}>
      <StatusBar />
      <div className="page__scroll">
        <div className="page__content" style={gap !== undefined ? { gap } : undefined}>
          {children}
        </div>
      </div>
      {footer && <div className="page__footer">{footer}</div>}
      {overlay}
      {tabs ? <TabBar /> : <div className={`home-indicator${dark ? ' home-indicator--light' : ''}`} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* TabBar                                                                */
/* ------------------------------------------------------------------ */
const tabs = [
  { to: '/', label: 'Today', icon: CalendarCheck, end: true },
  { to: '/circle', label: 'Circle', icon: Users },
  { to: '/navigate', label: 'Navigate', icon: Compass },
  { to: '/ask', label: 'Ask', icon: MessageSquare },
]
export function TabBar() {
  const { setAddOpen } = useStore()
  const { pathname } = useLocation()
  const item = (t: (typeof tabs)[number]) => (
    <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `tabbar__item${isActive || (t.to === '/circle' && pathname.startsWith('/people')) ? ' tabbar__item--active' : ''}`}>
      <t.icon size={24} strokeWidth={1.8} />
      {t.label}
    </NavLink>
  )
  return (
    <nav className="tabbar" aria-label="Main">
      {item(tabs[0])}
      {item(tabs[1])}
      <button type="button" className="tabbar__capture" aria-label="Add something" onClick={() => setAddOpen(true)}>
        <Plus size={28} strokeWidth={2.4} />
      </button>
      {item(tabs[2])}
      {item(tabs[3])}
      <div className="home-indicator" />
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* NavBar — back link + optional title + optional right action           */
/* ------------------------------------------------------------------ */
export function NavBar({ back, backTo, title, right, muted, onBack }: { back?: string; backTo?: string; title?: string; right?: ReactNode; muted?: boolean; onBack?: () => void }) {
  const navigate = useNavigate()
  const goBack = () => (onBack ? onBack() : backTo ? navigate(backTo) : navigate(-1))
  return (
    <div className="navbar">
      <button type="button" className={`navbar__side${muted ? ' navbar__side--muted' : ''}`} onClick={goBack}>
        {!muted && <ChevronLeft size={22} strokeWidth={2.2} />}
        {back}
      </button>
      {title && <span className="navbar__title">{title}</span>}
      <span className="navbar__side navbar__side--right">{right}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* BottomSheet                                                           */
/* ------------------------------------------------------------------ */
export function BottomSheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label}>
        <div className="sheet__handle" />
        {children}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Global overlays: toast + in-app push preview                         */
/* ------------------------------------------------------------------ */
export function GlobalOverlays() {
  const { toast, push } = useStore()
  return (
    <>
      {toast && (
        <div className="toast" role="status">
          {toast.text}
          {toast.actionLabel && (
            <button type="button" className="toast__action" onClick={toast.onAction}>
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
      {push && (
        <div className="push" role="status" aria-live="polite">
          <div className="push__head">
            <span className="push__app">C</span>
            <span className="push__label">CARECIRCLE</span>
            <span>now</span>
          </div>
          <strong style={{ fontSize: 15 }}>{push.title}</strong>
          <span style={{ fontSize: 15 }}>{push.body}</span>
        </div>
      )}
    </>
  )
}
