import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DCFPanel from './DCFPanel'
import { runDCF, DEFAULT_ASSUMPTIONS } from '../lib/dcf'

// Chart.js cannot run in jsdom — mock the chart component
vi.mock('react-chartjs-2', () => ({
  Bar: () => <canvas data-testid="bar-chart" />,
}))

const result = runDCF(DEFAULT_ASSUMPTIONS)

describe('DCFPanel', () => {
  it('renders without crashing', () => {
    render(<DCFPanel result={result} />)
  })

  it('shows DCF summary section', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('DCF summary')).toBeInTheDocument()
  })

  it('displays PV of FCFs metric', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('PV of FCFs (10yr)')).toBeInTheDocument()
  })

  it('displays PV terminal value metric', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('PV terminal value')).toBeInTheDocument()
  })

  it('displays enterprise value metric', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('Enterprise value')).toBeInTheDocument()
  })

  it('displays implied price metric', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('Implied price')).toBeInTheDocument()
  })

  it('shows 10-year projection table', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('10-year projection')).toBeInTheDocument()
  })

  it('renders all 10 year rows in the table', () => {
    render(<DCFPanel result={result} />)
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`Yr ${i}`)).toBeInTheDocument()
    }
  })

  it('renders the Terminal row', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByText('Terminal')).toBeInTheDocument()
  })

  it('renders the chart', () => {
    render(<DCFPanel result={result} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})
