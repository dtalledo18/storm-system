// components/common/KPICard.tsx

'use client';

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  variant?: 'default' | 'gold' | 'green' | 'purple' | 'orange';
}

export function KPICard({ label, value, delta, variant = 'default' }: KPICardProps) {
  const colorClass = variant === 'default' ? 'var(--accent2)' : `var(--${variant})`;

  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={{ color: colorClass }}>
        {value}
      </div>
      {delta && <div className="kpi-delta">{delta}</div>}
    </div>
  );
}
