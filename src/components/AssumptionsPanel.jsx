import React from 'react'
import { Card, SectionTitle, SliderRow, MetricCard } from './UI'
import { ACTUALS } from '../lib/dcf'

export default function AssumptionsPanel({ assumptions, onChange }) {
  const set = (key) => (val) => onChange({ ...assumptions, [key]: val })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionTitle>FY2025 actuals — starting point</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          <MetricCard label="Bookings" value="$6.8B" sub="+55% YoY" accent="var(--green)" />
          <MetricCard label="Revenue" value="$4.9B" sub="+36% YoY" />
          <MetricCard label="Op. cash flow" value="$1.8B" sub="+119% YoY" accent="var(--green)" />
          <MetricCard label="Free cash flow" value="~$1.2B" sub="est. FY2025" />
          <MetricCard label="Net cash" value="$5.5B" sub="Dec 2025" />
          <MetricCard label="DAUs" value="144M" sub="Q4 2025, +69%" accent="var(--accent)" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Growth assumptions</SectionTitle>
        <SliderRow label="Bookings growth — years 1–3" min={5} max={65} step={1} value={assumptions.g1} onChange={set('g1')} format={v => v + '%'} />
        <SliderRow label="Bookings growth — years 4–7" min={5} max={45} step={1} value={assumptions.g2} onChange={set('g2')} format={v => v + '%'} />
        <SliderRow label="Terminal growth rate" min={1} max={6} step={0.5} value={assumptions.tgr} onChange={set('tgr')} format={v => v.toFixed(1) + '%'} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.6 }}>
          FY2025 bookings grew 55%. Yr 1–3 assumption captures whether that momentum continues. Yr 4–7 reflects the mature steady-state. TGR should stay below WACC.
        </div>
      </Card>

      <Card>
        <SectionTitle>FCF margin assumptions (% of bookings)</SectionTitle>
        <SliderRow label="FCF margin — year 1" min={5} max={30} step={1} value={assumptions.m1} onChange={set('m1')} format={v => v + '%'} />
        <SliderRow label="FCF margin — year 7" min={10} max={45} step={1} value={assumptions.m2} onChange={set('m2')} format={v => v + '%'} />
        <SliderRow label="Terminal FCF margin" min={15} max={50} step={1} value={assumptions.mt} onChange={set('mt')} format={v => v + '%'} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.6 }}>
          FCF margins are expressed as % of bookings (not GAAP revenue) since bookings captures real cash intake. FY2025 FCF margin was ~18% of bookings. Bears see developer payouts capping this; bulls see infra leverage expanding it.
        </div>
      </Card>

      <Card>
        <SectionTitle>Discount rate & dilution</SectionTitle>
        <SliderRow label="WACC / discount rate" min={7} max={16} step={0.5} value={assumptions.wacc} onChange={set('wacc')} format={v => v.toFixed(1) + '%'} />
        <SliderRow label="SBC haircut applied to FCF" min={0} max={100} step={5} value={assumptions.sbc} onChange={set('sbc')} format={v => v + '%'} />
        <SliderRow label="Diluted shares (millions)" min={800} max={1500} step={10} value={assumptions.shares} onChange={set('shares')} format={v => v.toLocaleString() + 'M'} />
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.6 }}>
          SBC was $1.0B+ in FY2024. At 0% haircut you ignore it (common in tech); at 100% you treat it as a full economic cost. Most analysts use 50–75%. Shares account for future dilution from equity compensation.
        </div>
      </Card>
    </div>
  )
}
