// components/common/Header.tsx

'use client';

interface HeaderProps {
    alertCount: number;
    lastUpdate: string;
}

export function Header({ alertCount, lastUpdate }: HeaderProps) {
    return (
        <header className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-blue-900 px-4 py-2.5 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center text-lg font-bold">
                    ⚡
                </div>
                <div className="leading-none">
                    <div className="text-sm font-bold text-cyan-400 tracking-wide uppercase">Skytracker</div>
                    <div className="text-xs text-slate-500 tracking-widest uppercase">Hail Impact & Roofing Intelligence</div>
                </div>
            </div>

            {/* Status Center */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <div className="text-xs text-green-500 font-bold uppercase tracking-wide">Live Intelligence Feed</div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 border border-blue-900 rounded px-2.5 py-1 text-xs text-slate-400">
                    Region: <span className="text-cyan-400 font-bold">IL + WI</span>
                </div>
                <div className="bg-slate-800 border border-blue-900 rounded px-2.5 py-1 text-xs text-slate-400">
                    Active Alerts: <span className="text-cyan-400 font-bold">{alertCount}</span>
                </div>
                <div className="bg-slate-800 border border-blue-900 rounded px-2.5 py-1 text-xs text-slate-400">
                    Data Source: <span className="text-cyan-400 font-bold">NOAA/NWS</span>
                </div>
                <div className="bg-slate-800 border border-blue-900 rounded px-2.5 py-1 text-xs text-slate-400">
                    Updated: <span className="text-cyan-400 font-bold">{lastUpdate || '—'}</span>
                </div>
            </div>
        </header>
    );
}
