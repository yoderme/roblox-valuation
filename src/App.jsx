import React, { useState, useMemo } from 'react'
import { Tab } from './components/UI'
import AssumptionsPanel from './components/AssumptionsPanel'
import DCFPanel from './components/DCFPanel'
import CompsPanel from './components/CompsPanel'
import SensitivityPanel from './components/SensitivityPanel'
import ScenariosPanel from './components/ScenariosPanel'
import NarrativePanel from './components/NarrativePanel'
import { DEFAULT_ASSUMPTIONS, runDCF, fmtPrice, ACTUALS } from './lib/dcf'

const TABS = [
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'dcf', label: 'DCF Output' },
  { id: 'comps', label: 'Comps' },
  { id: 'sensitivity', label: 'Sensitivity' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'narrative', label: 'AI Analysis' },
]

export default function App() {
  const [tab, setTab] = useState('assumptions')
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS)
  const dcfResult = useMemo(() => runDCF(assumptions), [assumptions])

  const upsideColor = dcfResult.upside >= 0 ? '#34d399' : '#f87171'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        position: 'sticky',
        top: 0,
        background: 'var(--bg)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', fontWeight: 500, letterSpacing: '0.04em' }}>
            RBLX
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Valuation Model
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Current: $55
          </span>
          <span style={{
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: upsideColor,
          }}>
            {fmtPrice(dcfResult.pricePerShare)}
            <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>
              ({dcfResult.upside >= 0 ? '+' : ''}{dcfResult.upside.toFixed(0)}%)
            </span>
          </span>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px 60px' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {TABS.map(t => (
            <Tab
              key={t.id}
              label={t.label}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            />
          ))}
        </div>

        {tab === 'assumptions' && (
          <AssumptionsPanel assumptions={assumptions} onChange={setAssumptions} />
        )}
        {tab === 'dcf' && (
          <DCFPanel result={dcfResult} />
        )}
        {tab === 'comps' && (
          <CompsPanel shares={assumptions.shares} />
        )}
        {tab === 'sensitivity' && (
          <SensitivityPanel assumptions={assumptions} />
        )}
        {tab === 'scenarios' && (
          <ScenariosPanel assumptions={assumptions} />
        )}
        {tab === 'narrative' && (
          <NarrativePanel assumptions={assumptions} dcfResult={dcfResult} />
        )}
      </div>
    </div>
  )
}
