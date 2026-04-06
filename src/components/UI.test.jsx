import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Card, MetricCard, Badge, SectionTitle, SliderRow, Tab } from './UI'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>hello</Card>)
    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})

describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Price" value="$55" />)
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('$55')).toBeInTheDocument()
  })

  it('renders sub when provided', () => {
    render(<MetricCard label="Price" value="$55" sub="current" />)
    expect(screen.getByText('current')).toBeInTheDocument()
  })

  it('omits sub when not provided', () => {
    const { container } = render(<MetricCard label="Price" value="$55" />)
    // Only two text nodes: label and value
    expect(container.querySelectorAll('div')).toHaveLength(3) // wrapper + label + value
  })
})

describe('Badge', () => {
  it('renders its text', () => {
    render(<Badge color="green">+12%</Badge>)
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('falls back to blue for unknown color', () => {
    const { container } = render(<Badge color="magenta">test</Badge>)
    const span = container.querySelector('span')
    // Blue color value
    expect(span.style.color).toBe('rgb(79, 158, 255)')
  })
})

describe('SectionTitle', () => {
  it('renders children', () => {
    render(<SectionTitle>Model Output</SectionTitle>)
    expect(screen.getByText('Model Output')).toBeInTheDocument()
  })
})

describe('SliderRow', () => {
  it('renders the label and formatted value', () => {
    render(
      <SliderRow
        label="WACC"
        id="wacc"
        min={5}
        max={20}
        step={0.5}
        value={10}
        onChange={() => {}}
        format={v => `${v}%`}
      />
    )
    expect(screen.getByText('WACC')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('calls onChange with parsed float when slider moves', () => {
    const onChange = vi.fn()
    render(
      <SliderRow
        label="WACC"
        id="wacc"
        min={5}
        max={20}
        step={0.5}
        value={10}
        onChange={onChange}
      />
    )
    fireEvent.change(screen.getByRole('slider'), { target: { value: '12.5' } })
    expect(onChange).toHaveBeenCalledWith(12.5)
  })
})

describe('Tab', () => {
  it('renders label', () => {
    render(<Tab label="DCF" active={false} onClick={() => {}} />)
    expect(screen.getByText('DCF')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Tab label="DCF" active={false} onClick={onClick} />)
    fireEvent.click(screen.getByText('DCF'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
