import React from 'react'
import { Card, SectionTitle } from './UI'
import { runDCF, fmtPrice } from '../lib/dcf'

function cellColor(price) {
  if (price > 100) return { bg: '#0f6e56', text: '#9fe1cb' }
  if (price > 70) return { bg: '#1d9e75', text: '#e1f5ee' }
  if (price > 55) return { bg: '#285c3e', text: '#9fe1cb' }
  if (price > 40) return { bg: '#633806', text: '#fac775' }
  if (price > 25) return { bg: '#854f0b', text: '#faeeda' }
  return { bg: '#791f1f', text: '#f7c1c1' }
}

function HeatTable({ title, rowLabel, colLabel, rowVals, colVals, getPrice, highlight }) {
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '5px 8px', color: 'var(--text3)', fontWeight: 400, textAlign: 'left', whiteSpace: 'nowrap' }}>
                {rowLabel} \ {colLabel}
              </th>
              {colVals.map(c => (
                <th key={c} style={{ padding: '5px 6px', color: 'var(--text3)', fontWeight: 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowVals.map(r => (
              <tr key={r}>
                <td style={{ padding: '5px 8px', color: 'var(--text2)', whiteSpace: 'nowrap' }}>{r}</td>
                {colVals.map(c => {
                  const price = getPrice(r, c)
                  const { bg, text } = cellColor(price)
                  const isHighlight = highlight && highlight(r, c)
                  return (
                    <td key={c} style={{
                      padding: '5px 6px',
                      textAlign: 'center',
                      background: bg,
                      color: text,
                      borderRadius: 3,
                      border: isHighlight ? '1px solid #4f9eff' : 'none',
                      fontWeight: isHighlight ? 500 : 400,
                    }}>
                      {fmtPrice(price)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function SensitivityPanel({ assumptions }) {
  const waccVals = [8, 9, 10, 11, 12, 13]
  const tgrVals = [2, 2.5, 3, 3.5, 4, 4.5]
  const g1Vals = [15, 20, 25, 30, 35, 40, 50]
  const m2Vals = [16, 20, 24, 28, 32, 38]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeatTable
        title="WACC vs terminal growth rate"
        rowLabel="WACC"
        colLabel="TGR"
        rowVals={waccVals.map(v => v + '%')}
        colVals={tgrVals.map(v => v + '%')}
        getPrice={(r, c) => {
          const w = parseFloat(r)
          const t = parseFloat(c)
          const result = runDCF({ ...assumptions, wacc: w, tgr: t })
          return result.pricePerShare
        }}
        highlight={(r, c) => parseFloat(r) === assumptions.wacc && parseFloat(c) === assumptions.tgr}
      />

      <HeatTable
        title="Near-term growth vs year-7 FCF margin"
        rowLabel="Yr1-3 growth"
        colLabel="Yr7 FCF%"
        rowVals={g1Vals.map(v => v + '%')}
        colVals={m2Vals.map(v => v + '%')}
        getPrice={(r, c) => {
          const g = parseFloat(r)
          const m = parseFloat(c)
          const result = runDCF({ ...assumptions, g1: g, m2: m })
          return result.pricePerShare
        }}
        highlight={(r, c) => parseFloat(r) === assumptions.g1 && parseFloat(c) === assumptions.m2}
      />

      <Card>
        <SectionTitle>How to read these tables</SectionTitle>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, color: 'var(--text3)', lineHeight: 1.7 }}>
          {[
            { bg: '#0f6e56', text: '#9fe1cb', label: '> $100 — deep bull' },
            { bg: '#1d9e75', text: '#e1f5ee', label: '$70–100 — bull' },
            { bg: '#285c3e', text: '#9fe1cb', label: '$55–70 — fair value' },
            { bg: '#633806', text: '#fac775', label: '$40–55 — bear' },
            { bg: '#791f1f', text: '#f7c1c1', label: '< $25 — deep bear' },
          ].map(c => (
            <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: c.bg, border: `1px solid ${c.text}30`, flexShrink: 0 }} />
              {c.label}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10, lineHeight: 1.6 }}>
          Highlighted cell (blue border) = your current assumptions. The terminal value typically accounts for 70–80% of DCF value, making the WACC/TGR table the most mechanically important. Current price = $55.
        </div>
      </Card>
    </div>
  )
}
