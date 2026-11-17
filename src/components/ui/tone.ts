/** Semantic color pairs used across chips, tiles, avatars and banners. */
export type Tone =
  | 'green'
  | 'purple'
  | 'blue'
  | 'red'
  | 'amber'
  | 'teal'
  | 'neutral'
  | 'white'
  | 'dark'
  | 'solidGreen'

export const toneColors: Record<Tone, { bg: string; fg: string }> = {
  green: { bg: 'var(--mint)', fg: 'var(--green)' },
  purple: { bg: 'var(--lavender)', fg: 'var(--purple)' },
  blue: { bg: 'var(--blue-bg)', fg: 'var(--blue)' },
  red: { bg: 'var(--red-bg)', fg: 'var(--red)' },
  amber: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
  teal: { bg: 'var(--teal-bg)', fg: 'var(--teal)' },
  neutral: { bg: 'var(--sand)', fg: 'var(--ink)' },
  white: { bg: 'var(--surface)', fg: 'var(--ink)' },
  dark: { bg: 'var(--ink)', fg: '#fff' },
  solidGreen: { bg: 'var(--green)', fg: '#fff' },
}
