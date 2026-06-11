// app/api/campaigns/[id]/route.ts
import { updateCampaignActiveState, deleteCampaignFromDb } from '@/app/services/services-campaignService';
import { NextRequest, NextResponse } from 'next/server';

// 💡 Solución: Declaramos explícitamente que 'params' es una Promesa en el tipado de TypeScript
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Ahora sí hace match perfecto el await con el tipo Promise de arriba
        const params = await context.params;
        const id = params.id;

        const body = await req.json();
        console.log(`[API PUT] Intentando actualizar campaña ID: ${id} a estado active: ${body.active}`);

        // Validación de seguridad para IDs temporales de UI
        if (!id || id.startsWith('js_')) {
            console.error(`[API PUT] Error: Se intentó actualizar un ID temporal de la UI: ${id}`);
            return NextResponse.json({ error: "Cannot update a temporary UI jobsite" }, { status: 400 });
        }

        if (typeof body.active !== 'boolean') {
            return NextResponse.json({ error: "Missing or invalid 'active' field" }, { status: 400 });
        }

        const updated = await updateCampaignActiveState(id, body.active);
        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("[API PUT] Falló catastróficamente:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error?.message || error
        }, { status: 500 });
    }
}

// 💡 Aplicamos exactamente el mismo cambio al método DELETE
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = params.id;
        console.log(`[API DELETE] Intentando eliminar campaña ID: ${id}`);

        if (!id || id.startsWith('js_')) {
            return NextResponse.json({ error: "Cannot delete a temporary UI jobsite" }, { status: 400 });
        }

        await deleteCampaignFromDb(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[API DELETE] Falló:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}