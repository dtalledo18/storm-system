// app/api/leads/quality/route.ts
import { NextResponse } from 'next/server';
import { getLeadQualityScore } from '@/app/services/services-aiService';

export async function POST(req: Request) {
    try {
        const { alert, countyName } = await req.json();
        const result = await getLeadQualityScore(alert, countyName);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ score: 0, reason: "Error computing score" }, { status: 500 });
    }
}