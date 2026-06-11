import { prisma } from "@/app/utils/prisma";

export async function saveCampaignToDb(data: {
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    radiusKm: number;
    channels?: string;
}) {
    return await prisma.campaign.create({
        data: {
            name: data.name,
            address: data.address ?? null,
            lat: (data.lat ?? null) as number,
            lng: (data.lng ?? null) as number,
            radiusKm: data.radiusKm,
            channels: data.channels ?? 'Ads + SMS',
            active: true,
        }
    });
}

export async function getAllCampaigns() {
    return await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateCampaignActiveState(id: string, active: boolean) {
    return await prisma.campaign.update({
        where: { id },
        data: { active }
    });
}

export async function deleteCampaignFromDb(id: string) {
    return await prisma.campaign.delete({
        where: { id }
    });
}