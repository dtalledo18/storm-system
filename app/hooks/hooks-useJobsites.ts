// hooks/hooks-useJobsites.ts

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Jobsite, JobsiteFormData } from '@/app/types/types-jobsite';

const STORAGE_KEY = 'skytracker_jobsites';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const encoded = encodeURIComponent(address);
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    } catch {
        return null;
    }
}

export function useJobsites() {
    const [jobsites, setJobsites] = useState<Jobsite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setJobsites(JSON.parse(stored));
        } catch {
            // ignore
        }
    }, []);

    // Persist to localStorage whenever jobsites change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(jobsites));
        } catch {
            // ignore
        }
    }, [jobsites]);

    const addJobsite = useCallback(async (form: JobsiteFormData): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            const coords = await geocodeAddress(form.address);
            if (!coords) {
                setError('Could not geocode address. Please check it and try again.');
                return false;
            }

            const newJobsite: Jobsite = {
                id: `js_${Date.now()}`,
                name: form.name,
                address: form.address,
                lat: coords.lat,
                lng: coords.lng,
                radiusKm: form.radiusKm,
                channels: form.channels,
                createdAt: new Date().toISOString(),
                active: true,
            };

            setJobsites(prev => [...prev, newJobsite]);
            return true;
        } catch {
            setError('Unexpected error adding campaign zone.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeJobsite = useCallback((id: string) => {
        setJobsites(prev => prev.filter(j => j.id !== id));
    }, []);

    const toggleJobsite = useCallback((id: string) => {
        setJobsites(prev =>
            prev.map(j => j.id === id ? { ...j, active: !j.active } : j)
        );
    }, []);

    return {
        jobsites,
        loading,
        error,
        addJobsite,
        removeJobsite,
        toggleJobsite,
    };
}