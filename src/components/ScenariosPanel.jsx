import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Card, SectionTitle, Badge } from './UI'
import { SCENARIOS, runDCF, fmt, fmtPrice, ACTUALS } from '../lib/dcf'

export default function ScenariosPanel({ assumptions }) {
  const results = SCENARIOS.map(s => {
    const r = runDCF(s.name === 'Base' ? assumptions : s.assumptions)
    return { ...s, ...r }
  })

  const chartData = {
    labels: results.map(r => r.name),
    datasets: [
      {
        label: 'Implied price',
        data: results.map(r => Math.round(r.pricePerShare)),
        backgroundColor: results.map(r => r.color + 'cc'),
        borderRadius: 4,
      },
      {
        label: 'Current price ($55)',
        data: results.map(() => ACTUALS.currentPrice),
        type: 'line',
        borderColor: 'rgba(255,255,255,0.25)',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f1217',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: { label: c => ` ${c.dataset.label}: $${Math.round(c.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => '$' + v },
        min: 0,
      },
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
        {results.map(r => {
          const upside = ((r.pricePerShare - ACTUALS.currentPrice) / ACTUALS.currentPrice * 100)
          const badgeColor = upside >= 50 ? 'purple' : upside >= 20 ? 'green' : upside >= 0 ? 'blue' : upside >= -20 ? 'amber' : 'red'
          return (
            <div key={r.name} style={{
              background: 'var(--bg2)',
              border: `1px solid ${r.color}30`,
              borderRadius: 'var(--radius-lg)',
              padding: '14px',
            }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: r.color, fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, fontFamily: 'var(--font-mono)', color: r.color, marginBottom: 4 }}>
                {fmtPrice(r.pricePerShare)}
              </div>
              <Badge color={badgeColor}>{upside >= 0 ? '+' : ''}{upside.toFixed(0)}% vs $55</Badge>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.6 }}>
                {r.description}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                Gr {r.name === 'Base' ? assumptions.g1 : r.assumptions.g1}% · Mg {r.name === 'Base' ? assumptions.m2 : r.assumptions.m2}% · EV {fmt(r.ev)}
              </div>
            </div>
          )
        })}
      </div>

      <Card>
        <SectionTitle>Scenario price distribution</SectionTitle>
        <div style={{ height: 250 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Scenario assumptions detail</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr>
                {['Scenario', 'Gr Yr1-3', 'Gr Yr4-7', 'TGR', 'Marg Y1', 'Marg Y7', 'WACC', 'SBC%', 'Implied $'].map(h => (
                  <th key={h} style={{ padding: '5px 7px', textAlign: h === 'Scenario' ? 'left' : 'right', color: 'var(--text3)', fontWeight: 400, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const a = r.name === 'Base' ? assumptions : r.assumptions
                return (
                  <tr key={r.name} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 7px', color: r.color }}>{r.name}</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.g1}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.g2}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.tgr}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.m1}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.m2}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.wacc}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: 'var(--text2)' }}>{a.sbc}%</td>
                    <td style={{ padding: '5px 7px', textAlign: 'right', color: r.color, fontWeight: 500 }}>{fmtPrice(r.pricePerShare)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
