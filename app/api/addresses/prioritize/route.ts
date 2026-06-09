import { NextResponse } from 'next/server';
import { prioritizeAddresses, PrioritizedAddress } from '@/app/services/services-aiService';

export async function POST(req: Request) {
    try {
        const { addresses } = await req.json();

        if (!addresses || !Array.isArray(addresses)) {
            return NextResponse.json({ error: "Lista inválida" }, { status: 400 });
        }

        const prioritizedList = await prioritizeAddresses(addresses);

        // Ahora TypeScript sabe que a y b son PrioritizedAddress
        const sorted = prioritizedList.sort((a: PrioritizedAddress, b: PrioritizedAddress) =>
            b.priorityScore - a.priorityScore
        );

        return NextResponse.json(sorted);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}