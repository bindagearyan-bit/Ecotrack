import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StatCard, { CountUpNumber } from './StatCard';
import { Leaf } from 'lucide-react';

// Mock countup.js since it interacts with DOM in raw ways
vi.mock('countup.js', () => {
  return {
    CountUp: vi.fn().mockImplementation((el, end) => {
      // immediately set element value to end value for testing assertions
      if (el) el.innerHTML = String(end);
      return {
        error: null,
        start: vi.fn()
      };
    })
  };
});

// Mock resize-observer to prevent recharts issues in test environment
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CountUpNumber Component', () => {
  it('displays end value correctly', async () => {
    render(<CountUpNumber end={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});

describe('StatCard Component', () => {
  it('renders title, value and icon', async () => {
    render(
      <StatCard 
        title="Eco Savings" 
        value={150} 
        icon={Leaf} 
        colorClass="bg-brand-green/10" 
      />
    );

    expect(screen.getByText('ECO SAVINGS')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('renders trend details for carbon type card', () => {
    render(
      <StatCard 
        title="Monthly Carbon" 
        value={230} 
        type="carbon"
        trend="↓ 12% saved"
        colorClass="bg-red-50"
      />
    );

    expect(screen.getByText('↓ 12% saved')).toBeInTheDocument();
  });

  it('renders progress bar for average type card', () => {
    render(
      <StatCard 
        title="Daily Average" 
        value={8.5} 
        type="average"
        progress={75}
        subtext="Global Average: 10kg"
        colorClass="bg-blue-50"
      />
    );

    expect(screen.getByText('Global Average: 10kg')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
