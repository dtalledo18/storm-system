import { NextResponse } from 'next/server';
import { extractCampaignDataFromImage} from "@/app/services/services-aiService";

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 });
        }

        const campaignData = await extractCampaignDataFromImage(image);

        if (!campaignData) {
            return NextResponse.json({ error: "La IA no pudo interpretar la geolocalización del mapa" }, { status: 422 });
        }

        return NextResponse.json(campaignData);
    } catch (error) {
        console.error("Error en API Route Campaigns:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}