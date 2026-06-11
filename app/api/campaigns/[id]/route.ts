// app/api/campaigns/[id]/route.ts
import { NextResponse } from 'next/server';
import { updateCampaignActiveState, deleteCampaignFromDb } from '@/app/services/services-campaignService';

export async function PUT(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        // Aseguramos la captura del ID desde los parámetros de la URL
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

export async function DELETE(
    req: Request,
    context: { params: { id: string } }
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