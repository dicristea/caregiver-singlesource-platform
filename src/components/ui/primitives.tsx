import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toneColors, type Tone } from './tone'
import './ui.css'

const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/* Card                                                                 */
/* ------------------------------------------------------------------ */
type CardTint = 'red' | 'mint' | 'amber' | 'teal' | 'sand' | 'bg'
export interface CardProps {
  children: ReactNode
  /** 16px padding + 12px gap (most content cards). Off for list cards. */
  pad?: boolean
  shadow?: boolean
  tint?: CardTint
  selected?: boolean
  radius?: 20 | 18 | 16 | 14 | 12
  gap?: number
  padding?: string
  onClick?: () => void
  className?: string
  style?: CSSProperties
  label?: string
}
export function Card({ children, pad = true, shadow, tint, selected, radius = 20, gap, padding, onClick, className, style, label }: CardProps) {
  const classes = cx(
    'card',
    pad && 'card--pad',
    !pad && 'card--flush',
    shadow && 'card--shadow',
    tint && `card--tint-${tint}`,
    selected && 'card--selected',
    radius !== 20 && `card--r${radius}`,
    className,
  )
  const s: CSSProperties = { ...(gap !== undefined ? { gap } : {}), ...(padding ? { padding } : {}), ...style }
  if (onClick)
    return (
      <button type="button" className={classes} style={s} onClick={onClick} aria-label={label}>
        {children}
      </button>
    )
  return (
    <div className={classes} style={s}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ListRow — a row inside a flush Card; dividers are automatic          */
/* ------------------------------------------------------------------ */
export interface ListRowProps {
  leading?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  value?: ReactNode
  chevron?: boolean
  onClick?: () => void
  medium?: boolean
  alignTop?: boolean
  padding?: string
  titleColor?: string
  children?: ReactNode
}
export function ListRow({ leading, title, subtitle, trailing, value, chevron, onClick, medium, alignTop, padding, titleColor, children }: ListRowProps) {
  const inner = (
    <>
      {leading}
      <span className="list-row__body">
        <span className={cx('list-row__title', medium && 'list-row__title--medium')} style={titleColor ? { color: titleColor } : undefined}>
          {title}
        </span>
        {subtitle && <span className="list-row__sub">{subtitle}</span>}
        {children}
      </span>
      {value && <span className="list-row__value">{value}</span>}
      {trailing}
      {chevron && <ChevronRight size={20} strokeWidth={1.7} className="list-row__chev" />}
    </>
  )
  const cls = cx('list-row', alignTop && 'list-row--top')
  const style = padding ? { padding } : undefined
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={cls} style={style}>
      {inner}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* IconTile — rounded square holding an icon                             */
/* ------------------------------------------------------------------ */
export function IconTile({ icon: Icon, tone = 'green', size = 36, radius, iconSize, strokeWidth = 2 }: { icon: LucideIcon; tone?: Tone; size?: number; radius?: number; iconSize?: number; strokeWidth?: number }) {
  const { bg, fg } = toneColors[tone]
  return (
    <span className="icon-tile" style={{ width: size, height: size, borderRadius: radius ?? Math.round(size * 0.28), background: bg, color: fg }}>
      <Icon size={iconSize ?? Math.round(size * 0.5)} strokeWidth={strokeWidth} />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Chip                                                                  */
/* ------------------------------------------------------------------ */
export function Chip({ children, tone = 'neutral', icon: Icon, size = 'md', outline, onClick, style }: { children: ReactNode; tone?: Tone; icon?: LucideIcon; size?: 'xs' | 'sm' | 'md' | 'lg'; outline?: boolean; onClick?: () => void; style?: CSSProperties }) {
  const { bg, fg } = toneColors[tone]
  const iconPx = size === 'lg' ? 14 : size === 'md' ? 13 : 12
  const content = (
    <>
      {Icon && <Icon size={iconPx} strokeWidth={2.2} />}
      {children}
    </>
  )
  const cls = cx('chip', `chip--${size}`, outline && 'chip--outline')
  const s = outline ? style : { background: bg, color: fg, ...style }
  return onClick ? (
    <button type="button" className={cls} style={s} onClick={onClick}>
      {content}
    </button>
  ) : (
    <span className={cls} style={s}>
      {content}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Button                                                                */
/* ------------------------------------------------------------------ */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  full?: boolean
}
export function Button({ variant = 'primary', size = 'md', icon: Icon, full, children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx('btn', `btn--${variant}`, `btn--${size}`, full && 'btn--full', className)} {...rest}>
      {Icon && <Icon size={size === 'lg' ? 18 : 16} strokeWidth={2} />}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Toggle / Radio                                                        */
/* ------------------------------------------------------------------ */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange?: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={cx('toggle', checked && 'toggle--on')} onClick={() => onChange?.(!checked)}>
      <span className="toggle__knob" />
    </button>
  )
}
export function Radio({ checked }: { checked: boolean }) {
  return <span className={cx('radio', checked && 'radio--on')} aria-hidden />
}

/* ------------------------------------------------------------------ */
/* Avatar                                                                */
/* ------------------------------------------------------------------ */
export function Avatar({ initials, tone = 'green', size = 32 }: { initials: string; tone?: Tone; size?: number }) {
  const { bg, fg } = toneColors[tone]
  const fontSize = size >= 60 ? 22 : size >= 50 ? 18 : size >= 38 ? 13 : size >= 30 ? 12 : 10
  return (
    <span className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize }}>
      {initials}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* SegmentedControl                                                      */
/* ------------------------------------------------------------------ */
export function SegmentedControl<T extends string>({ options, value, onChange, large }: { options: Array<{ value: T; label: string }>; value: T; onChange: (v: T) => void; large?: boolean }) {
  return (
    <div className={cx('segmented', large && 'segmented--lg')} role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={cx('segmented__item', o.value === value && 'segmented__item--active')} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Small bits                                                            */
/* ------------------------------------------------------------------ */
export function SectionLabel({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <p className="t-section" style={color ? { color } : undefined}>
      {children}
    </p>
  )
}

export function Progress({ value, tone = 'green', thin }: { value: number; tone?: Tone; thin?: boolean }) {
  const color = tone === 'amber' ? 'var(--amber)' : tone === 'red' ? 'var(--red)' : 'var(--green)'
  return (
    <div className={cx('progress', thin && 'progress--thin')} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress__bar" style={{ width: `${Math.min(1, Math.max(0, value)) * 100}%`, background: color }} />
    </div>
  )
}

export function Banner({ children, tone = 'red', icon: Icon, onClick, trailing }: { children: ReactNode; tone?: 'red' | 'amber' | 'mint'; icon?: LucideIcon; onClick?: () => void; trailing?: ReactNode }) {
  const inner = (
    <>
      {Icon && <Icon size={18} strokeWidth={2} />}
      <span style={{ flex: 1 }}>{children}</span>
      {trailing}
    </>
  )
  return onClick ? (
    <button type="button" className={cx('banner', `banner--${tone}`)} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className={cx('banner', `banner--${tone}`)}>{inner}</div>
  )
}

export function NumberedSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s}>
          <span className="steps__n">{i + 1}.</span>
          <span>{s}</span>
        </li>
      ))}
    </ol>
  )
}

export function KeyValue({ k, v, color }: { k: string; v: ReactNode; color?: string }) {
  return (
    <div className="kv">
      <span className="kv__k">{k}</span>
      <span className="kv__v" style={color ? { color } : undefined}>
        {v}
      </span>
    </div>
  )
}

export function ScreenHeader({ title, subtitle, eyebrow, right }: { title: string; subtitle?: ReactNode; eyebrow?: string; right?: ReactNode }) {
  return (
    <div className="screen-header">
      <div className="screen-header__text">
        {eyebrow && <span className="t-eyebrow">{eyebrow}</span>}
        <h1 className="t-h1">{title}</h1>
        {subtitle && <p className="screen-header__sub">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}
