'use client';

import { useState, DragEvent } from 'react';
import { CampaignData } from "@/app/services/services-aiService";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCampaignAdded: (data: CampaignData) => void;
}

export function AddContactCampaignModal({
                                            isOpen,
                                            onClose,
                                            onCampaignAdded
                                        }: ModalProps) {

    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const [manualLat, setManualLat] = useState("");
    const [manualLng, setManualLng] = useState("");
    const [manualRadius, setManualRadius] = useState("5");
    const [manualName, setManualName] = useState("");

    if (!isOpen) return null;

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const processImageFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("Please upload image files only.");
            return;
        }

        setLoading(true);

        try {
            const base64 = await fileToBase64(file);

            const res = await fetch('/api/campaigns/extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64
                })
            });

            if (!res.ok) {
                throw new Error("Processing failed");
            }

            const data: CampaignData = await res.json();

            onCampaignAdded(data);
            onClose();

        } catch (error) {
            console.error(error);

            alert(
                "Unable to process the image. Please try again or use the manual setup option."
            );

        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (file) {
            await processImageFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (!loading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (
        e: DragEvent<HTMLDivElement>
    ) => {
        e.preventDefault();

        setIsDragging(false);

        if (loading) return;

        const file = e.dataTransfer.files?.[0];

        if (file) {
            await processImageFile(file);
        }
    };

    const handleManualSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (loading) return;

        if (!manualLat || !manualLng) return;

        onCampaignAdded({
            name: manualName || "Manual Campaign Zone",
            lat: parseFloat(manualLat),
            lng: parseFloat(manualLng),
            radiusKm: parseFloat(manualRadius)
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-6">

            <div className="relative bg-[#06142e] border border-[#1e3a8a] rounded-xl w-full max-w-4xl h-[70vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center">

                            <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mb-4" />

                            <h3 className="text-white font-semibold text-sm mb-1">
                                Generating Campaign
                            </h3>

                            <p className="text-slate-400 text-xs text-center max-w-xs">
                                Please wait while we analyze the map and extract campaign coordinates.
                            </p>

                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[#1e3a8a]">

                    <h2 className="text-white font-bold text-lg tracking-wide">
                        📢 Create Contact Campaign
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

                <div className="flex flex-1 overflow-hidden">

                    {/* Screenshot Upload */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex-1 border-r border-[#1e3a8a] flex flex-col items-center justify-center p-6 transition-all duration-200 ${
                            isDragging
                                ? 'bg-[#10b98110] border-dashed border-[#10b981]'
                                : 'bg-[#081226]'
                        } ${
                            loading
                                ? 'pointer-events-none opacity-60'
                                : ''
                        }`}
                    >

                        <div className="text-center pointer-events-none">

                            <span
                                className={`text-4xl block mb-3 transition-transform ${
                                    isDragging ? 'scale-125' : ''
                                }`}
                            >
                                {isDragging ? "📥" : "📸"}
                            </span>

                            <h3 className="text-white font-semibold mb-1 text-sm">
                                {isDragging
                                    ? "Drop your map screenshot here!"
                                    : "Upload Map Screenshot"}
                            </h3>

                            <p className="text-xs text-slate-400 max-w-xs mb-4">
                                Drag and drop an image or select one from your device to automatically extract campaign coordinates.
                            </p>

                            <label
                                className={`text-white font-bold text-xs px-4 py-2 rounded-lg transition-all inline-block pointer-events-auto ${
                                    loading
                                        ? 'bg-slate-600 cursor-not-allowed'
                                        : 'bg-[#10b981] hover:bg-[#059669] cursor-pointer'
                                }`}
                            >
                                {loading
                                    ? "Analyzing Map..."
                                    : "SELECT IMAGE"}

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                            </label>

                        </div>

                    </div>

                    {/* Manual Form */}
                    <form
                        onSubmit={handleManualSubmit}
                        className="flex-1 flex flex-col p-6 space-y-4 justify-center"
                    >

                        <h3 className="text-white font-semibold text-sm border-b border-[#1e3a8a] pb-2 text-[#38bdf8]">
                            Or Setup Manually
                        </h3>

                        <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">
                                Campaign Name
                            </label>

                            <input
                                type="text"
                                disabled={loading}
                                className="w-full bg-[#0a1930] border border-[#1e3a8a] rounded p-2 text-xs text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                value={manualName}
                                onChange={e => setManualName(e.target.value)}
                                placeholder="e.g. Evanston Restorations"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">
                                    Latitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    required
                                    disabled={loading}
                                    className="w-full bg-[#0a1930] border border-[#1e3a8a] rounded p-2 text-xs text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={manualLat}
                                    onChange={e => setManualLat(e.target.value)}
                                    placeholder="42.0451"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">
                                    Longitude
                                </label>

                                <input
                                    type="number"
                                    step="any"
                                    required
                                    disabled={loading}
                                    className="w-full bg-[#0a1930] border border-[#1e3a8a] rounded p-2 text-xs text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={manualLng}
                                    onChange={e => setManualLng(e.target.value)}
                                    placeholder="-87.6877"
                                />
                            </div>

                        </div>

                        <div>
                            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">
                                Radius (KM)
                            </label>

                            <input
                                type="number"
                                step="any"
                                disabled={loading}
                                className="w-full bg-[#0a1930] border border-[#1e3a8a] rounded p-2 text-xs text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                value={manualRadius}
                                onChange={e => setManualRadius(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded text-xs font-bold transition-all ${
                                loading
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#1e3a8a] hover:bg-[#2548ad] text-white'
                            }`}
                        >
                            {loading
                                ? 'PROCESSING...'
                                : 'DRAW CAMPAIGN ZONE'}
                        </button>

                    </form>

                </div>
            </div>
        </div>
    );
}