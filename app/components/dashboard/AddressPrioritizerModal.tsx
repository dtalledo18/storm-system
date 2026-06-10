'use client';

import { useState } from 'react';

export function AddressPrioritizerModal({
                                            isOpen,
                                            onClose
                                        }: {
    isOpen: boolean;
    onClose: () => void;
}) {

    const [input, setInput] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePrioritize = async () => {
        setLoading(true);

        const addresses = input
            .split('\n')
            .filter(line => line.trim() !== "");

        try {
            const res = await fetch('/api/addresses/prioritize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ addresses })
            });

            const data = await res.json();

            setResults(data);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-6">

            <div className="relative bg-[#06142e] border border-[#1e3a8a] rounded-xl w-full max-w-7xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center">

                            <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4" />

                            <h3 className="text-white font-semibold text-sm mb-1">
                                Prioritizing Addresses
                            </h3>

                            <p className="text-slate-400 text-xs text-center max-w-xs">
                                Please wait while AI analyzes and ranks your address list.
                            </p>

                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#1e3a8a]">

                    <h2 className="text-white font-bold text-lg tracking-wide">
                        ⚡ AI Address Prioritizer
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={loading}
                        className={`text-xl transition-colors ${
                            loading
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        ✕
                    </button>

                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Column */}
                    <div
                        className={`flex-1 border-r border-[#1e3a8a] flex flex-col p-4 ${
                            loading
                                ? 'pointer-events-none opacity-60'
                                : ''
                        }`}
                    >

                        <label className="text-xs text-[#38bdf8] font-bold uppercase mb-2">
                            Addresses to Analyze
                        </label>

                        <textarea
                            disabled={loading}
                            className="flex-1 w-full bg-[#0a1930] border border-[#1e3a8a] text-white p-4 rounded-lg focus:outline-none focus:border-[#10b981] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Paste addresses here, one per line..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />

                        <button
                            onClick={handlePrioritize}
                            disabled={loading || !input.trim()}
                            className="mt-4 w-full bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Analyzing Addresses..."
                                : "PRIORITIZE ADDRESSES"}
                        </button>

                    </div>

                    {/* Right Column */}
                    <div
                        className={`flex-1 flex flex-col p-4 bg-[#081226] relative ${
                            loading
                                ? 'pointer-events-none opacity-60'
                                : ''
                        }`}
                    >

                        <label className="text-xs text-[#38bdf8] font-bold uppercase mb-2">
                            Prioritized List
                        </label>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">

                            {results.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                                    Results will appear here...
                                </div>
                            ) : (
                                results.map((r, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#06142e] p-3 rounded border border-[#1e3a8a] flex justify-between items-center"
                                    >
                                        <span className="text-slate-200 text-sm">
                                            {r.address}
                                        </span>

                                        <span className="text-[#10b981] font-black text-sm ml-4">
                                            {r.priorityScore} pts
                                        </span>
                                    </div>
                                ))
                            )}

                        </div>

                        {/* Copy Button */}
                        {results.length > 0 && (
                            <button
                                onClick={() => {
                                    const text = results
                                        .map(
                                            r =>
                                                `${r.address} - ${r.priorityScore} pts`
                                        )
                                        .join('\n');

                                    navigator.clipboard.writeText(text);
                                }}
                                disabled={loading}
                                title="Copy Results"
                                className="absolute cursor-pointer bottom-4 right-4 p-3 bg-[#1e3a8a] hover:bg-[#2d4a8e] text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="9"
                                        y="9"
                                        width="13"
                                        height="13"
                                        rx="2"
                                        ry="2"
                                    />

                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                            </button>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}