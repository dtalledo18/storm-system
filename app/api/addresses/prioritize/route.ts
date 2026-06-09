import { NextResponse } from 'next/server';
import { prioritizeAddresses } from '@/app/services/services-aiService';

export async function POST(req: Request) {
    try {
        const { addresses } = await req.json();

        if (!addresses || !Array.isArray(addresses)) {
            return NextResponse.json({ error: "Lista inválida" }, { status: 400 });
        }

        const prioritizedList = await prioritizeAddresses(addresses);

        // Ordenamos por score descendente antes de devolver
        const sorted = prioritizedList.sort((a, b) => b.priorityScore - a.priorityScore);

        return NextResponse.json(sorted);
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}