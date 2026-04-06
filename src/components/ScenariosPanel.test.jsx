import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScenariosPanel from './ScenariosPanel'
import { DEFAULT_ASSUMPTIONS, SCENARIOS } from '../lib/dcf'

// Chart.js cannot run in jsdom — mock the chart component
vi.mock('react-chartjs-2', () => ({
  Bar: () => <canvas data-testid="bar-chart" />,
}))

describe('ScenariosPanel', () => {
  it('renders without crashing', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
  })

  it('renders a card for each scenario', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
    SCENARIOS.forEach(s => {
      expect(screen.getAllByText(s.name).length).toBeGreaterThan(0)
    })
  })

  it('renders the scenario price distribution chart', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
    expect(screen.getByText('Scenario price distribution')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders the scenario assumptions detail table', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
    expect(screen.getByText('Scenario assumptions detail')).toBeInTheDocument()
  })

  it('shows all expected table columns', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
    ;['Gr Yr1-3', 'Gr Yr4-7', 'TGR', 'WACC', 'Implied $'].forEach(col => {
      expect(screen.getByText(col)).toBeInTheDocument()
    })
  })

  it('uses current assumptions for the Base scenario', () => {
    const custom = { ...DEFAULT_ASSUMPTIONS, g1: 99 }
    render(<ScenariosPanel assumptions={custom} />)
    // g1=99 should appear in the Base row
    expect(screen.getByText('99%')).toBeInTheDocument()
  })

  it('shows description for each scenario', () => {
    render(<ScenariosPanel assumptions={DEFAULT_ASSUMPTIONS} />)
    SCENARIOS.forEach(s => {
      expect(screen.getByText(s.description)).toBeInTheDocument()
    })
  })
})
