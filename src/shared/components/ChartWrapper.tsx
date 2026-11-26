import type { CSSProperties, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

export interface ChartThemeColors {
  gridColor: string;
  axisColor: string;
  tooltipContentStyle: CSSProperties;
  tooltipLabelStyle: CSSProperties;
  tooltipItemStyle: CSSProperties;
}

export type ChartWrapperContent = ReactNode | ((theme: ChartThemeColors) => ReactNode);

export interface ChartWrapperProps {
  children: ChartWrapperContent;
  height?: number;
  minWidth?: number;
  className?: string;
}

const CHART_THEME: ChartThemeColors = {
  gridColor: 'var(--border-subtle)',
  axisColor: 'var(--text-muted)',
  tooltipContentStyle: {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: '0.5rem',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
  },
  tooltipLabelStyle: {
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  tooltipItemStyle: {
    color: 'var(--text-primary)',
  },
};

export function ChartWrapper({
  children,
  height = 280,
  minWidth = 0,
  className = '',
}: ChartWrapperProps) {
  const content = typeof children === 'function' ? children(CHART_THEME) : children;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={minWidth}>
        {content}
      </ResponsiveContainer>
    </div>
  );
}
