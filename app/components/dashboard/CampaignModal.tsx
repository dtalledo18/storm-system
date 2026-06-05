// components/dashboard/CampaignModal.tsx

'use client';

import { useState } from 'react';
import { JobsiteFormData } from '@/app/types/types-jobsite';

interface CampaignModalProps {
    onClose: () => void;
    onSubmit: (data: JobsiteFormData) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

const CHANNEL_OPTIONS = ['Ads + SMS', 'Ads Only', 'SMS Only', 'Email + Ads', 'All Channels'];

export function CampaignModal({ onClose, onSubmit, loading, error }: CampaignModalProps) {
    const [form, setForm] = useState<JobsiteFormData>({
        name: '',
        address: '',
        radiusKm: 1,
        channels: 'Ads + SMS'
    });

    const handleChange = (field: keyof JobsiteFormData, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.address.trim()) return;
        const ok = await onSubmit(form);
        if (ok) onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 bg-opacity-70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#0a1b3a] border border-[#1e3a8a] rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e3a8a]">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                            <span className="text-sm font-bold text-[#FFD700] uppercase tracking-widest">
                New Campaign Zone
              </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
                            Jobsite Radius Targeting
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4">

                    {/* Campaign Name */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                            Campaign Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="e.g. Jobsite – Oak Park"
                            className="w-full bg-[#06142e] border border-[#1e3a8a] rounded px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#10b981] focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                            Jobsite Address
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={e => handleChange('address', e.target.value)}
                            placeholder="1205 Rossell Ave, Oak Park, IL"
                            className="w-full bg-[#06142e] border border-[#1e3a8a] rounded px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-[#10b981] focus:outline-none transition-colors"
                        />
                        <p className="text-[9px] text-slate-600 mt-1">Full address for geocoding. Be as specific as possible.</p>
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                            Campaign Radius — <span className="text-[#10b981]">{form.radiusKm} km</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                min={0.5}
                                max={10}
                                step={0.5}
                                value={form.radiusKm}
                                onChange={e => handleChange('radiusKm', parseFloat(e.target.value))}
                                className="flex-1 accent-[#10b981] cursor-pointer"
                            />
                            <div className="flex gap-1">
                                {[1, 2, 5].map(km => (
                                    <button
                                        key={km}
                                        onClick={() => handleChange('radiusKm', km)}
                                        className={`px-2 py-1 text-[10px] rounded border transition-all ${
                                            form.radiusKm === km
                                                ? 'border-[#10b981] text-[#10b981] bg-[#10b98115]'
                                                : 'border-[#1e3a8a] text-slate-500 hover:border-[#10b981] hover:text-[#10b981]'
                                        }`}
                                    >
                                        {km}km
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Channels */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                            Channels
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {CHANNEL_OPTIONS.map(ch => (
                                <button
                                    key={ch}
                                    onClick={() => handleChange('channels', ch)}
                                    className={`px-2.5 py-1 text-[10px] rounded border transition-all ${
                                        form.channels === ch
                                            ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf815]'
                                            : 'border-[#1e3a8a] text-slate-500 hover:border-[#38bdf8] hover:text-[#38bdf8]'
                                    }`}
                                >
                                    {ch}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-950 border border-red-800 rounded px-3 py-2 text-xs text-red-400">
                            ⚠ {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-[#1e3a8a] flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest border border-[#1e3a8a] text-slate-400 rounded hover:border-slate-500 hover:text-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !form.name.trim() || !form.address.trim()}
                        className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest bg-[#10b981] text-[#06142e] rounded hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-3 h-3 border-2 border-[#06142e] border-t-transparent rounded-full animate-spin" />
                                Geocoding…
                            </>
                        ) : (
                            'Add Campaign'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}