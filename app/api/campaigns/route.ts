import { NextResponse } from 'next/server';
import { extractCampaignDataFromImage } from '@/app/services/services-aiService'; // Tu servicio anterior
import {getAllCampaigns, saveCampaignToDb} from '@/app/services/services-campaignService';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        // Codificamos la dirección para que sea segura en la URL
        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: {
                // Nominatim pide un User-Agent identificable para no bloquear las peticiones
                'User-Agent': 'StormIQ-App-Development'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();

        // Si encontró la dirección, devolvemos las coordenadas parseadas a float
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon) // Ojo: Nominatim devuelve 'lon', no 'lng'
            };
        }

        return null;
    } catch (error) {
        console.error("Error en el servicio de Geocoding:", error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        let campaignData;

        if (body.image) {
            // Opción 1: Viene de la captura de pantalla (IA)
            campaignData = await extractCampaignDataFromImage(body.image);
        } else if (body.address) {
            // Opción 2: Viene del formulario de dirección (CampaignModal)
            const coords = await geocodeAddress(body.address);

            if (!coords) {
                return NextResponse.json(
                    { error: "Could not find coordinates for the provided address." },
                    { status: 422 }
                );
            }

            campaignData = {
                name: body.name,
                lat: coords.lat,
                lng: coords.lng,
                radiusKm: parseFloat(body.radiusKm)
            };
        } else {
            // Opción 3: Coordenadas directas manuales (AddContactCampaignModal)
            campaignData = {
                name: body.name,
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
                radiusKm: parseFloat(body.radiusKm)
            };
        }

        if (!campaignData || !campaignData.lat || !campaignData.lng) {
            return NextResponse.json({ error: "Invalid campaign data parameters." }, { status: 400 });
        }

        // Guardamos de forma persistente en PostgreSQL mediante Prisma
        const saved = await saveCampaignToDb(campaignData);
        return NextResponse.json(saved);

    } catch (error) {
        console.error("Error crítico en el POST de campañas:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    const campaigns = await getAllCampaigns();
    return NextResponse.json(campaigns);
}