// components/common/Header.tsx

'use client';

interface HeaderProps {
  alertCount: number;
  lastUpdate: string;
}

export function Header({ alertCount, lastUpdate }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">⚡</div>
        <div className="logo-text">
          <div className="logo-title">StormIQ Enterprise</div>
          <div className="logo-sub">Hail Impact & Roofing Intelligence Platform</div>
        </div>
      </div>
      <div className="header-center">
        <div className="status-dot"></div>
        <div className="status-label">Live Intelligence Feed</div>
      </div>
      <div className="header-right">
        <div className="hdr-badge">Region: <span>IL + WI</span></div>
        <div className="hdr-badge">Active Alerts: <span>{alertCount}</span></div>
        <div className="hdr-badge">Data Source: <span>NOAA/NWS</span></div>
        <div className="hdr-badge">Updated: <span>{lastUpdate || '—'}</span></div>
      </div>
    </header>
  );
}
