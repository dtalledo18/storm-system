// components/common/Header.tsx

'use client';

interface HeaderProps {
    alertCount: number;
    lastUpdate: string;
}

export function Header({ alertCount, lastUpdate }: HeaderProps) {
    return (
        <header className="bg-[#06142e] border-b border-[#1e3a8a] px-4 py-0 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                <div className="w-20 h-20 flex items-center justify-center">
                    {/* Aquí iría tu logo, mantenemos el espacio */}
                    <img src="/logo.png" alt="Logo" className="object-contain" />
                </div>
                <div className="leading-tight">
                    <div className="text-lg font-bold text-[#FFD700] tracking-wide">SKYTRACKER</div>
                    <div className="text-[10px] text-white tracking-widest uppercase">Hail Impact & Roofing Intelligence</div>
                </div>
            </div>

            {/* Status Center */}
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="text-xs text-green-500 font-bold uppercase tracking-wide">Live Intelligence Feed</div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
                <div className="bg-[#0a1b3a] border border-[#1e3a8a] rounded px-3 py-1.5 text-xs text-slate-300">
                    Region: <span className="text-[#FFD700] font-bold">IL + WI</span>
                </div>
                <div className="bg-[#0a1b3a] border border-[#1e3a8a] rounded px-3 py-1.5 text-xs text-slate-300">
                    Active Alerts: <span className="text-[#FFD700] font-bold">{alertCount}</span>
                </div>
                <div className="bg-[#0a1b3a] border border-[#1e3a8a] rounded px-3 py-1.5 text-xs text-slate-300">
                    Data Source: <span className="text-[#FFD700] font-bold">Data Source:</span>
                </div>
                <div className="bg-[#0a1b3a] border border-[#1e3a8a] rounded px-3 py-1.5 text-xs text-slate-300">
                    Updated: <span className="text-[#FFD700] font-bold">{lastUpdate || '—'}</span>
                </div>
            </div>
        </header>
    );
}