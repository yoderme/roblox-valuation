import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler } from 'chart.js'
import { Card, SectionTitle, MetricCard, Badge } from './UI'
import { fmt, fmtPrice, fmtPct, ACTUALS } from '../lib/dcf'

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Filler)

export default function DCFPanel({ result }) {
  const { rows, sumPvFcf, pvTv, ev, pricePerShare, upside } = result
  const tvPct = Math.round(pvTv / (sumPvFcf + pvTv) * 100)
  const upsideColor = upside >= 0 ? 'var(--green)' : 'var(--red)'
  const badgeColor = upside >= 30 ? 'green' : upside >= 0 ? 'blue' : upside >= -20 ? 'amber' : 'red'

  const chartData = {
    labels: rows.map(r => `Yr ${r.year}`),
    datasets: [
      {
        label: 'Adj FCF',
        data: rows.map(r => r.adjFcf),
        backgroundColor: 'rgba(79,158,255,0.7)',
        borderRadius: 3,
        yAxisID: 'y',
        type: 'bar',
      },
      {
        label: 'Bookings',
        data: rows.map(r => r.bookings),
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,0.08)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y2',
        type: 'line',
        pointRadius: 3,
        pointBackgroundColor: '#fbbf24',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f1217',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#8b90a0',
        bodyColor: '#e8eaf0',
        callbacks: { label: c => ` ${c.dataset.label}: ${fmt(c.parsed.y)}` },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => fmt(v) }, title: { display: true, text: 'Adj FCF', color: '#545968', font: { size: 10 } } },
      y2: { position: 'right', grid: { display: false }, ticks: { color: '#545968', font: { family: 'IBM Plex Mono', size: 11 }, callback: v => fmt(v) }, title: { display: true, text: 'Bookings', color: '#545968', font: { size: 10 } } },
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionTitle>DCF summary</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          <MetricCard label="PV of FCFs (10yr)" value={fmt(sumPvFcf)} />
          <MetricCard label="PV terminal value" value={fmt(pvTv)} sub={`${tvPct}% of EV`} />
          <MetricCard label="Enterprise value" value={fmt(ev)} />
          <MetricCard
            label="Implied price"
            value={fmtPrice(pricePerShare)}
            sub={<Badge color={badgeColor}>{fmtPct(upside, 0)} vs $55</Badge>}
            accent={upsideColor}
          />
        </div>
      </Card>

      <Card>
        <SectionTitle>10-year projection</SectionTitle>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr>
                {['Year', 'Bookings', 'FCF %', 'Raw FCF', 'Adj FCF', 'PV FCF'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Year' ? 'left' : 'right', padding: '6px 8px', color: 'var(--text3)', fontWeight: 400, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.year} style={{ background: i === 9 ? 'var(--bg2)' : 'transparent' }}>
                  <td style={{ padding: '5px 8px', color: 'var(--text2)' }}>Yr {r.year}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--amber)' }}>{fmt(r.bookings)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--text2)' }}>{r.margin.toFixed(1)}%</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--text2)' }}>{fmt(r.rawFcf)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: r.adjFcf < 0 ? 'var(--red)' : 'var(--text)' }}>{fmt(r.adjFcf)}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--accent)' }}>{fmt(r.pvFcf)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border2)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--text2)' }}>Terminal</td>
                <td colSpan={3} />
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--text)' }}>{fmt(result.tv)}</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--accent)' }}>{fmt(pvTv)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <SectionTitle>Adj FCF & bookings trajectory</SectionTitle>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(79,158,255,0.7)', display: 'inline-block' }} />Adj FCF
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
            <span style={{ width: 10, height: 2, background: '#fbbf24', display: 'inline-block' }} />Bookings
          </span>
        </div>
        <div style={{ height: 240 }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </Card>
    </div>
  )
}
