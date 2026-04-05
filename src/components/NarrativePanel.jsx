import React, { useState } from 'react'
import { Card, SectionTitle } from './UI'
import { useNarrative } from '../hooks/useNarrative'
import { fmt, fmtPrice, ACTUALS } from '../lib/dcf'

const PROMPTS = [
  'Give me a balanced bull/bear assessment of this valuation',
  'What are the biggest risks to this DCF?',
  'How does the 18+ demographic shift affect this model?',
  'Is the terminal value assumption reasonable for a platform like Roblox?',
  'Compare Roblox to other consumer platforms at similar stages',
]

export default function NarrativePanel({ assumptions, dcfResult }) {
  const { narrative, loading, error, generate } = useNarrative()
  const [prompt, setPrompt] = useState('')

  function handleGenerate(p) {
    generate(assumptions, dcfResult, p || prompt || PROMPTS[0])
  }

  const implied = fmtPrice(dcfResult.pricePerShare)
  const upside = dcfResult.upside.toFixed(1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <SectionTitle>Current model snapshot</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Implied price', value: implied, color: dcfResult.upside >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Upside vs $55', value: (upside >= 0 ? '+' : '') + upside + '%', color: dcfResult.upside >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Yr1-3 growth', value: assumptions.g1 + '%', color: 'var(--amber)' },
            { label: 'Yr7 FCF margin', value: assumptions.m2 + '%', color: 'var(--accent)' },
            { label: 'WACC', value: assumptions.wacc + '%', color: 'var(--text2)' },
            { label: 'SBC haircut', value: assumptions.sbc + '%', color: 'var(--text2)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'var(--font-mono)', color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Ask Claude to analyze this model</SectionTitle>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => { setPrompt(p); handleGenerate(p) }}
              style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 99,
                padding: '4px 12px',
                fontSize: 11,
                color: 'var(--text2)',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.1s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)' }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            rows={2}
            placeholder="Or ask your own question about this valuation..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            style={{
              background: loading ? 'var(--bg3)' : 'var(--accent2)',
              border: 'none',
              borderRadius: 'var(--radius)',
              padding: '0 18px',
              color: loading ? 'var(--text3)' : '#fff',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              cursor: loading ? 'not-allowed' : 'pointer',
              alignSelf: 'stretch',
              minWidth: 80,
              transition: 'all 0.12s',
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </Card>

      {error && (
        <Card>
          <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
            Error: {error}. Make sure your Anthropic API key is configured (see README).
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <LoadingDots />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Generating analysis with your current assumptions...</span>
          </div>
        </Card>
      )}

      {narrative && !loading && (
        <Card>
          <SectionTitle>Investment memo</SectionTitle>
          <div style={{
            fontSize: 13,
            lineHeight: 1.85,
            color: 'var(--text2)',
            whiteSpace: 'pre-wrap',
          }}>
            {narrative}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)' }}>
            Analysis generated using assumptions above. Not financial advice. Re-generate after changing assumptions to update the narrative.
          </div>
        </Card>
      )}

      {!narrative && !loading && (
        <Card>
          <SectionTitle>How this works</SectionTitle>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: 8 }}>This feature calls the Claude API with your current slider values and DCF output as context. The model then generates a structured investment memo — in the style of a sell-side equity note — tailored to your specific assumptions.</p>
            <p style={{ marginBottom: 8 }}>Try adjusting the assumptions in the Assumptions tab first, then come back here to generate analysis. Changing your growth or margin assumptions will produce meaningfully different narratives.</p>
            <p>Click any suggested prompt above or write your own. Press Enter or click Analyze.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }`}</style>
    </div>
  )
}
