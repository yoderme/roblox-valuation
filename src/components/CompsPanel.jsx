import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { Card, SectionTitle, MetricCard, Badge } from './UI'
import { COMPS, ACTUALS, fmt, fmtPrice } from '../lib/dcf'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function CompsPanel({ shares }) {
  const sharesB = shares / 1000
  const peerMultiples = COMPS.filter(c => c.name !== 'Discord (est.)').map(c => c.multiple)
  const median = [...peerMultiples].sort((a, b) => a - b)[Math.floor(peerMultiples.length / 2)]
  const impliedEV = ACTUALS.bookings * median
  const impliedPrice = (impliedEV + ACTUALS.netCash) / sharesB
  const premiumPrice = (ACTUALS.bookings * 6 + ACTUALS.netCash) / sharesB
  const discountPrice = (ACTUALS.bookings * 3 + ACTUALS.netCash) / sharesB

  const allComps = [
    { name: 'RBLX (implied)', multiple: median, color: '#4f9eff', isSubject: true },
    ...COMPS.map(c => ({ ...c, color: '#2a3550', isSubject: false })),
  ]

  const chartData = {
    labels: allComps.map(c => c.name),
    datasets: [{
      data: allComps.map(c => c.multiple),
      backgroundColor: allComps.map(c => c.color),
      borderRadius: 3,
    }],
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
        callbacks: { label: c => ` ${c.parsed.y.toFixed(1)}x EV/Bookings` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 10 }, maxRotation: 30 } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => v + 'x' }, min: 0 },
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionTitle>Trading comps — EV / bookings</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr>
                {['Company', 'Bookings est.', 'EV est.', 'EV/Bookings', 'Note'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Company' || h === 'Note' ? 'left' : 'right', padding: '6px 8px', color: 'var(--text3)', fontWeight: 400, borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPS.map(c => (
                <tr key={c.name}>
                  <td style={{ padding: '5px 8px', color: 'var(--text)' }}>{c.name}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--amber)' }}>{fmt(c.bookings)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--text2)' }}>{fmt(c.ev)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--accent)' }}>{c.multiple.toFixed(1)}x</td>
                  <td style={{ padding: '5px 8px', color: 'var(--text3)', fontSize: 11 }}>{c.note}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border2)', background: 'var(--bg2)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--text)', fontWeight: 500 }}>Median (ex-Discord)</td>
                <td colSpan={2} />
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--green)', fontWeight: 500 }}>{median.toFixed(1)}x</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ height: 200, marginTop: 16 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>

      <Card>
        <SectionTitle>Implied RBLX price at various multiples</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
          <MetricCard label={`${median.toFixed(1)}x (peer median)`} value={fmtPrice(impliedPrice)}
            sub={<Badge color={impliedPrice > 55 ? 'green' : 'red'}>{((impliedPrice - 55) / 55 * 100).toFixed(0)}% vs $55</Badge>} />
          <MetricCard label="3.0x (deep discount)" value={fmtPrice(discountPrice)}
            sub={<Badge color="red">{((discountPrice - 55) / 55 * 100).toFixed(0)}% vs $55</Badge>} />
          <MetricCard label="6.0x (premium)" value={fmtPrice(premiumPrice)}
            sub={<Badge color="green">{((premiumPrice - 55) / 55 * 100).toFixed(0)}% vs $55</Badge>} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 12, lineHeight: 1.6 }}>
          Discord is excluded from the median — its 20x multiple reflects private market scarcity premium. Note that Roblox's superior growth profile (55% bookings growth vs. peers at 5–15%) could justify a meaningful premium to the peer median.
        </div>
      </Card>
    </div>
  )
}
