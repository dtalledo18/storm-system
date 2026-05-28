'use client';

import { useState } from 'react';
import DashboardPage from "@/app/dashboard/page";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2333') setIsAuthenticated(true);
    else {
      alert("Invalid Access Code");
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#060a10] text-slate-300">
          {/* Contenedor tipo "Card" similar a tus KPIs */}
          <div className="w-full max-w-sm bg-[#0b121e] border border-blue-900/50 p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-bold tracking-widest text-white uppercase">EliteLeadStorm</h1>
              <p className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] mt-1">Secure Access Gateway</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS CODE"
                  className="w-full bg-[#060a10] border border-blue-900 px-4 py-3 text-center text-lg tracking-widest text-white focus:border-cyan-500 focus:outline-none transition-all"
              />
              <button
                  type="submit"
                  className="w-full bg-cyan-500/10 border border-cyan-500/50 py-3 text-xs font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all"
              >
                ACCESS
              </button>
            </form>

            <div className="mt-8 text-[9px] text-slate-600 text-center uppercase tracking-widest">
              Advanced Team Elite © 2026
            </div>
          </div>
        </div>
    );
  }

  return <DashboardPage />;
}