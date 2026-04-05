export const ACTUALS = {
  bookings: 6.8,
  revenue: 4.9,
  opCashFlow: 1.8,
  fcf: 1.2,
  netCash: 5.5,
  dau: 144,
  sbcAnnual: 1.1,
  currentPrice: 55,
  sharesM: 1050,
}

export const DEFAULT_ASSUMPTIONS = {
  g1: 35,
  g2: 20,
  tgr: 3,
  m1: 17,
  m2: 28,
  mt: 32,
  wacc: 10,
  sbc: 50,
  shares: 1050,
}

export function runDCF(assumptions) {
  const { g1, g2, tgr, m1, m2, mt, wacc, sbc, shares } = assumptions
  const { bookings: base, netCash, sbcAnnual } = ACTUALS

  const rows = []
  let bk = base

  for (let y = 1; y <= 10; y++) {
    const gr = y <= 3 ? g1 : g2
    bk = bk * (1 + gr / 100)
    const margin = m1 + (m2 - m1) * ((y - 1) / 9)
    const rawFcf = bk * (margin / 100)
    const sbcCost = sbcAnnual * (1 + 0.05 * (y - 1))
    const adjFcf = rawFcf - sbcCost * (sbc / 100)
    const pvFcf = adjFcf / Math.pow(1 + wacc / 100, y)
    rows.push({
      year: y,
      bookings: +bk.toFixed(2),
      margin: +margin.toFixed(1),
      rawFcf: +rawFcf.toFixed(2),
      adjFcf: +adjFcf.toFixed(2),
      pvFcf: +pvFcf.toFixed(2),
    })
  }

  const termFcf = rows[9].adjFcf * (1 + tgr / 100)
  const tv = termFcf / (wacc / 100 - tgr / 100)
  const pvTv = tv / Math.pow(1 + wacc / 100, 10)
  const sumPvFcf = rows.reduce((acc, r) => acc + r.pvFcf, 0)
  const ev = sumPvFcf + pvTv + netCash
  const pricePerShare = ev / (shares / 1000)
  const upside = ((pricePerShare - ACTUALS.currentPrice) / ACTUALS.currentPrice) * 100

  return { rows, sumPvFcf, pvTv, tv, ev, pricePerShare, upside }
}

export const SCENARIOS = [
  {
    name: 'Deep bear',
    color: '#f87171',
    description: 'Growth stalls, margins never materialize',
    assumptions: { g1: 12, g2: 8, tgr: 2, m1: 10, m2: 16, mt: 20, wacc: 13, sbc: 80, shares: 1200 },
  },
  {
    name: 'Bear',
    color: '#fbbf24',
    description: 'Slowdown + SBC remains a drag',
    assumptions: { g1: 20, g2: 12, tgr: 2.5, m1: 13, m2: 22, mt: 26, wacc: 11, sbc: 65, shares: 1150 },
  },
  {
    name: 'Base',
    color: '#4f9eff',
    description: 'Consensus: steady growth, gradual margin expansion',
    assumptions: { ...DEFAULT_ASSUMPTIONS },
  },
  {
    name: 'Bull',
    color: '#34d399',
    description: '18+ cohort drives monetization flywheel',
    assumptions: { g1: 40, g2: 25, tgr: 4, m1: 20, m2: 32, mt: 38, wacc: 9, sbc: 35, shares: 1000 },
  },
  {
    name: 'Deep bull',
    color: '#a78bfa',
    description: 'Platform becomes the dominant social layer',
    assumptions: { g1: 50, g2: 32, tgr: 4.5, m1: 22, m2: 38, mt: 42, wacc: 8, sbc: 20, shares: 950 },
  },
]

export const COMPS = [
  { name: 'EA', bookings: 7.6, ev: 32.0, multiple: 4.2, note: 'Game publisher' },
  { name: 'Take-Two', bookings: 5.3, ev: 25.0, multiple: 4.7, note: 'Game publisher' },
  { name: 'Snap', bookings: 5.4, ev: 18.0, multiple: 3.3, note: 'Social media' },
  { name: 'Pinterest', bookings: 4.0, ev: 15.2, multiple: 3.8, note: 'Social platform' },
  { name: 'Unity', bookings: 1.8, ev: 7.2, multiple: 4.0, note: 'Game tools' },
  { name: 'Discord (est.)', bookings: 0.7, ev: 14.0, multiple: 20.0, note: 'Gaming social' },
]

export function fmt(n, dec = 1) {
  if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(1) + 'T'
  if (Math.abs(n) >= 1) return '$' + n.toFixed(dec) + 'B'
  return '$' + (n * 1000).toFixed(0) + 'M'
}

export function fmtPrice(n) {
  return '$' + Math.round(n)
}

export function fmtPct(n, dec = 1) {
  return (n >= 0 ? '+' : '') + n.toFixed(dec) + '%'
}
