// app/api/leads/quality/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBatchLeadQuality } from '@/app/services/services-aiService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // payload: Array<{ idx: number, alert: AlertFeature, county: string }>
        const { payload } = body;

        if (!Array.isArray(payload) || payload.length === 0) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // getBatchLeadQuality now expects { idx, alert, county }[]
        const results = await getBatchLeadQuality(payload);

        // Returns [{ idx, score, reason }] — frontend maps back to real IDs by idx
        return NextResponse.json(results);

    } catch (error) {
        console.error('[API/batch] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}