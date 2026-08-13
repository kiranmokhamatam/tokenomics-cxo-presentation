export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US')

export const fmtTokens = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${(n / 1000).toFixed(1)}K` : fmtInt(n)

export const fmtSeconds = (s: number) => `${s.toFixed(1)}s`

export const fmtCost = (c: number) =>
  c >= 1000 ? `$${fmtInt(c)}` : c >= 1 ? `$${c.toFixed(2)}` : `$${c.toFixed(3)}`

export const fmtMoney = (c: number) => {
  if (c >= 1_000_000) return `$${(c / 1_000_000).toFixed(2)}M`
  if (c >= 10_000) return `$${Math.round(c / 1000).toLocaleString('en-US')}K`
  return `$${fmtInt(c)}`
}

export const fmtRuns = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M` : `${Math.round(n / 1000)}K`

export const fmtPct = (p: number) => `${Math.round(p * 100)}%`
