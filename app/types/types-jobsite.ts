// types/types-jobsite.ts

export interface Jobsite {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    radiusKm: number;
    channels: string;
    createdAt: string;
    active: boolean;
}

export interface JobsiteFormData {
    name: string;
    address: string;
    radiusKm: number;
    channels: string;
}