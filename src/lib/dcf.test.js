import { describe, it, expect } from 'vitest'
import { runDCF, fmt, fmtPrice, fmtPct, DEFAULT_ASSUMPTIONS, ACTUALS } from './dcf'

// ─── runDCF ────────────────────────────────────────────────────────────────

describe('runDCF', () => {
  it('returns the expected shape', () => {
    const result = runDCF(DEFAULT_ASSUMPTIONS)
    expect(result).toHaveProperty('rows')
    expect(result).toHaveProperty('sumPvFcf')
    expect(result).toHaveProperty('pvTv')
    expect(result).toHaveProperty('tv')
    expect(result).toHaveProperty('ev')
    expect(result).toHaveProperty('pricePerShare')
    expect(result).toHaveProperty('upside')
  })

  it('produces exactly 10 rows', () => {
    const { rows } = runDCF(DEFAULT_ASSUMPTIONS)
    expect(rows).toHaveLength(10)
  })

  it('rows are numbered 1–10', () => {
    const { rows } = runDCF(DEFAULT_ASSUMPTIONS)
    rows.forEach((r, i) => expect(r.year).toBe(i + 1))
  })

  it('applies g1 growth rate for years 1–3 and g2 for years 4–10', () => {
    const assumptions = { ...DEFAULT_ASSUMPTIONS, g1: 40, g2: 10 }
    const { rows } = runDCF(assumptions)
    const base = ACTUALS.bookings

    // Year 1: base * 1.40
    expect(rows[0].bookings).toBeCloseTo(base * 1.40, 1)
    // Year 4: yr3 * 1.10
    expect(rows[3].bookings).toBeCloseTo(rows[2].bookings * 1.10, 1)
  })

  it('FCF margin interpolates linearly from m1 to m2 across 10 years', () => {
    const assumptions = { ...DEFAULT_ASSUMPTIONS, m1: 10, m2: 20 }
    const { rows } = runDCF(assumptions)
    // Year 1 margin = m1 + (m2 - m1) * ((1-1)/9) = 10
    expect(rows[0].margin).toBeCloseTo(10, 1)
    // Year 10 margin = m1 + (m2 - m1) * (9/9) = 20
    expect(rows[9].margin).toBeCloseTo(20, 1)
    // Year 5 (index 4) should be midpoint-ish: 10 + 10 * (4/9) ≈ 14.4
    expect(rows[4].margin).toBeCloseTo(10 + 10 * (4 / 9), 1)
  })

  it('rawFcf equals bookings * margin / 100', () => {
    const { rows } = runDCF(DEFAULT_ASSUMPTIONS)
    rows.forEach(r => {
      expect(r.rawFcf).toBeCloseTo(r.bookings * (r.margin / 100), 1)
    })
  })

  it('sbc=0 means adjFcf equals rawFcf', () => {
    const { rows } = runDCF({ ...DEFAULT_ASSUMPTIONS, sbc: 0 })
    rows.forEach(r => {
      expect(r.adjFcf).toBeCloseTo(r.rawFcf, 1)
    })
  })

  it('sbc=100 applies full SBC cost deduction', () => {
    const { rows } = runDCF({ ...DEFAULT_ASSUMPTIONS, sbc: 100 })
    rows.forEach((r, i) => {
      const sbcCost = ACTUALS.sbcAnnual * (1 + 0.05 * i)
      expect(r.adjFcf).toBeCloseTo(r.rawFcf - sbcCost, 1)
    })
  })

  it('pvFcf discounts adjFcf by WACC', () => {
    const wacc = 10
    const { rows } = runDCF({ ...DEFAULT_ASSUMPTIONS, wacc })
    rows.forEach(r => {
      expect(r.pvFcf).toBeCloseTo(r.adjFcf / Math.pow(1 + wacc / 100, r.year), 1)
    })
  })

  it('sumPvFcf equals sum of all row pvFcf values', () => {
    const { rows, sumPvFcf } = runDCF(DEFAULT_ASSUMPTIONS)
    const sum = rows.reduce((acc, r) => acc + r.pvFcf, 0)
    expect(sumPvFcf).toBeCloseTo(sum, 1)
  })

  it('EV equals sumPvFcf + pvTv + netCash', () => {
    const { sumPvFcf, pvTv, ev } = runDCF(DEFAULT_ASSUMPTIONS)
    expect(ev).toBeCloseTo(sumPvFcf + pvTv + ACTUALS.netCash, 1)
  })

  it('pricePerShare equals EV / (shares / 1000)', () => {
    const shares = 1050
    const { ev, pricePerShare } = runDCF({ ...DEFAULT_ASSUMPTIONS, shares })
    expect(pricePerShare).toBeCloseTo(ev / (shares / 1000), 1)
  })

  it('upside is relative to currentPrice', () => {
    const { pricePerShare, upside } = runDCF(DEFAULT_ASSUMPTIONS)
    const expected = ((pricePerShare - ACTUALS.currentPrice) / ACTUALS.currentPrice) * 100
    expect(upside).toBeCloseTo(expected, 1)
  })

  it('higher WACC produces lower implied price', () => {
    const low = runDCF({ ...DEFAULT_ASSUMPTIONS, wacc: 8 })
    const high = runDCF({ ...DEFAULT_ASSUMPTIONS, wacc: 14 })
    expect(low.pricePerShare).toBeGreaterThan(high.pricePerShare)
  })

  it('higher growth produces higher implied price', () => {
    const low = runDCF({ ...DEFAULT_ASSUMPTIONS, g1: 10, g2: 5 })
    const high = runDCF({ ...DEFAULT_ASSUMPTIONS, g1: 50, g2: 30 })
    expect(high.pricePerShare).toBeGreaterThan(low.pricePerShare)
  })

  it('higher share count produces lower price per share', () => {
    const fewer = runDCF({ ...DEFAULT_ASSUMPTIONS, shares: 900 })
    const more = runDCF({ ...DEFAULT_ASSUMPTIONS, shares: 1400 })
    expect(fewer.pricePerShare).toBeGreaterThan(more.pricePerShare)
  })

  it('terminal value uses perpetuity growth formula', () => {
    const a = DEFAULT_ASSUMPTIONS
    const { rows, tv } = runDCF(a)
    const termFcf = rows[9].adjFcf * (1 + a.tgr / 100)
    const expected = termFcf / (a.wacc / 100 - a.tgr / 100)
    expect(tv).toBeCloseTo(expected, 1)
  })
})

// ─── fmt ───────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('formats billions', () => {
    expect(fmt(6.8)).toBe('$6.8B')
  })

  it('formats billions with custom decimals', () => {
    expect(fmt(6.123, 2)).toBe('$6.12B')
  })

  it('formats millions (values < 1B)', () => {
    expect(fmt(0.5)).toBe('$500M')
  })

  it('formats trillions', () => {
    expect(fmt(1500)).toBe('$1.5T')
  })

  it('handles negative billions', () => {
    expect(fmt(-2.5)).toBe('$-2.5B')
  })
})

// ─── fmtPrice ──────────────────────────────────────────────────────────────

describe('fmtPrice', () => {
  it('rounds to nearest dollar', () => {
    expect(fmtPrice(54.6)).toBe('$55')
    expect(fmtPrice(54.4)).toBe('$54')
  })

  it('formats whole numbers', () => {
    expect(fmtPrice(100)).toBe('$100')
  })
})

// ─── fmtPct ────────────────────────────────────────────────────────────────

describe('fmtPct', () => {
  it('prefixes positive values with +', () => {
    expect(fmtPct(12.5)).toBe('+12.5%')
  })

  it('does not double-prefix negative values', () => {
    expect(fmtPct(-8.3)).toBe('-8.3%')
  })

  it('formats zero as +0.0%', () => {
    expect(fmtPct(0)).toBe('+0.0%')
  })

  it('respects custom decimal places', () => {
    expect(fmtPct(5.1234, 2)).toBe('+5.12%')
  })
})
