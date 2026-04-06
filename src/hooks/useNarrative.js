import { useState } from 'react'
import { fmt, fmtPrice } from '../lib/dcf'

export function useNarrative() {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function generate(assumptions, dcfResult, prompt) {
    setLoading(true)
    setError(null)
    setNarrative('')

    const context = `
You are a sell-side equity analyst writing a brief investment memo section on Roblox Corporation (NYSE: RBLX).

Current model assumptions:
- Bookings growth Yr 1-3: ${assumptions.g1}%
- Bookings growth Yr 4-7: ${assumptions.g2}%
- Terminal growth rate: ${assumptions.tgr}%
- FCF margin Yr 1: ${assumptions.m1}% of bookings
- FCF margin Yr 7: ${assumptions.m2}% of bookings
- Terminal FCF margin: ${assumptions.mt}%
- WACC: ${assumptions.wacc}%
- SBC haircut applied to FCF: ${assumptions.sbc}%
- Diluted shares: ${assumptions.shares}M

DCF output:
- PV of FCFs (10yr): ${fmt(dcfResult.sumPvFcf)}
- PV of terminal value: ${fmt(dcfResult.pvTv)} (${(dcfResult.pvTv / (dcfResult.sumPvFcf + dcfResult.pvTv) * 100).toFixed(0)}% of EV)
- Enterprise value: ${fmt(dcfResult.ev)}
- Implied share price: ${fmtPrice(dcfResult.pricePerShare)}
- Upside vs $55 current price: ${dcfResult.upside.toFixed(1)}%

Key business context:
- FY2025 actuals: bookings $6.8B (+55% YoY), revenue $4.9B (+36%), op cash flow $1.8B, DAUs 144M (+69%)
- Revenue is recognized over ~27-month user lifetime (GAAP revenue lags bookings significantly)
- Cost structure: ~23% app store fees, ~26% developer payouts (DevEx), ~14% infra + T&S, ~$1B+ annual SBC
- Key thesis: 18+ demographic growing 50%+, monetizes 40% better than younger cohorts
- Bear risk: SBC dilution, developer payouts scale with engagement, platform safety regulatory risk

User's specific question or focus: ${prompt}

Write a concise, analytical 3-4 paragraph memo in the style of a Bloomberg Intelligence note. Be direct, use specific numbers, acknowledge key risks and uncertainties. Avoid filler phrases. End with a one-sentence verdict on the implied share price vs current price given these assumptions.
`.trim()

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: context }],
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'API error')
      }

      const data = await response.json()
      const text = data.content?.map(b => b.text || '').join('')
      setNarrative(text)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { narrative, loading, error, generate }
}
