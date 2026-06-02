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
        <div className="flex items-center justify-center min-h-screen bg-[#06142e] text-slate-300">
          {/* Contenedor tipo "Card" con los nuevos colores */}
          <div className="w-full max-w-sm bg-[#0a1b3a] border border-[#1e3a8a] p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-xl font-bold tracking-widest text-[#FFD700] uppercase">Skytracker</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">Secure Access Gateway</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS CODE"
                  className="w-full bg-[#06142e] border border-[#1e3a8a] px-4 py-3 text-center text-lg tracking-widest text-white focus:border-[#FFD700] focus:outline-none transition-all placeholder:text-slate-600"
              />
              <button
                  type="submit"
                  className="w-full bg-[#0a1b3a] border border-[#FFD700] py-3 text-xs font-bold uppercase tracking-widest text-[#FFD700] hover:bg-[#FFD700] hover:text-[#06142e] transition-all"
              >
                ACCESS
              </button>
            </form>

            <div className="mt-8 text-[9px] text-slate-500 text-center uppercase tracking-widest">
              Advanced Team Elite © 2026
            </div>
          </div>
        </div>
    );
  }

  return <DashboardPage />;
}