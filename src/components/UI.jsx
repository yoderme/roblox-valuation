import React from 'react'

export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)',
      borderRadius: 'var(--radius)',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-mono)', color: accent || 'var(--text)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export function Badge({ children, color }) {
  const colorMap = {
    green: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
    red: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
    amber: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    blue: { bg: 'rgba(79,158,255,0.12)', color: '#4f9eff' },
    purple: { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  }
  const c = colorMap[color] || colorMap.blue
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      padding: '2px 7px',
      borderRadius: 99,
      background: c.bg,
      color: c.color,
      fontWeight: 500,
    }}>
      {children}
    </span>
  )
}

export function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--text3)',
      fontFamily: 'var(--font-mono)',
      marginBottom: 14,
    }}>
      {children}
    </div>
  )
}

export function SliderRow({ label, id, min, max, step, value, onChange, format }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text2)', flex: '0 0 210px' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent)',
        minWidth: 52,
        textAlign: 'right',
      }}>
        {format ? format(value) : value}
      </span>
    </div>
  )
}

export function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--bg3)' : 'transparent',
        border: `1px solid ${active ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '5px 14px',
        fontSize: 12,
        fontFamily: 'var(--font-mono)',
        color: active ? 'var(--text)' : 'var(--text3)',
        cursor: 'pointer',
        transition: 'all 0.12s',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </button>
  )
}
