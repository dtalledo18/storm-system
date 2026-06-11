// hooks/hooks-useJobsites.ts
'use client';

import { useState, useCallback } from 'react';
import { Jobsite, JobsiteFormData } from '@/app/types/types-jobsite';

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
    // 💡 AHORA: El estado inicial nace vacío porque el DashboardPage se encarga de poblarlo vía API
    const [jobsites, setJobsites] = useState<Jobsite[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * 1. AGREGAR CAMPAÑA:
     * Ahora recibe opcionalmente los datos ya listos desde la DB (id, lat, lng, active).
     * Si no vienen, calcula las coordenadas en caliente.
     */
    const addJobsite = useCallback(async (
        form: JobsiteFormData & { lat?: number; lng?: number; id?: string; active?: boolean }
    ): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            let coords: { lat: number; lng: number } | null = null;

            if (form.lat != null && form.lng != null) {
                coords = { lat: form.lat, lng: form.lng };
            } else {
                coords = await geocodeAddress(form.address);
                if (!coords) {
                    setError('Could not geocode address. Please check it and try again.');
                    return false;
                }
            }

            // Forzamos que cada Jobsite use estrictamente el ID real provisto por Postgres
            if (!form.id) {
                setError('Internal Error: Missing unique identifier from database.');
                return false;
            }

            const newJobsite: Jobsite = {
                id: form.id,
                name: form.name,
                address: form.address,
                lat: coords.lat,
                lng: coords.lng,
                radiusKm: form.radiusKm,
                channels: form.channels,
                createdAt: new Date().toISOString(),
                active: form.active ?? true,
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

    /**
     * 2. ELIMINAR CAMPAÑA:
     * Despacha la mutación directo a tu API dinámica en la base de datos de manera optimista.
     */
    const removeJobsite = useCallback(async (id: string) => {
        const confirmDelete = confirm("Are you sure you want to permanently delete this campaign zone?");
        if (!confirmDelete) return;

        const previousJobsites = [...jobsites];

        // Optimistic UI: Removemos visualmente al instante
        setJobsites(prev => prev.filter(j => j.id !== id));

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Server failed to delete campaign");
        } catch (err) {
            console.error("Error removing campaign from DB:", err);
            alert("Could not delete campaign zone from server. Restoring state.");
            setJobsites(previousJobsites); // Revertimos si hay error de red/servidor
        }
    }, [jobsites]);

    /**
     * 3. ALTERNAR ESTADO (ACTIVATE / DEACTIVATE):
     * Invierte la bandera active directo contra la base de datos de manera limpia.
     */
    const toggleJobsite = useCallback(async (id: string) => {
        const target = jobsites.find(j => j.id === id);
        if (!target) return;

        const nextActiveState = !target.active;
        const previousJobsites = [...jobsites];

        // Optimistic UI: Cambiamos estado visual en caliente
        setJobsites(prev =>
            prev.map(j => j.id === id ? { ...j, active: nextActiveState } : j)
        );

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: nextActiveState })
            });

            if (!res.ok) throw new Error("Server failed to update campaign state");
        } catch (err) {
            console.error("Error toggling campaign active state in DB:", err);
            alert("Could not update campaign zone active state on server. Reverting change.");
            setJobsites(previousJobsites); // Revertimos si hay error
        }
    }, [jobsites]);

    return {
        jobsites,
        setJobsites, // Exponemos temporalmente el mutador por si necesitas un reset global directo
        loading,
        error,
        addJobsite,
        removeJobsite,
        toggleJobsite,
    };
}