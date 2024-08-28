export type UpdateAdType = {
    state?: string;
    category?: string;
    images?: {
        url: string;
        default: boolean;
    }[];
    title?: string;
    price?: number;
    priceNegotiable?: boolean;
    description?: string;
    status?: string;
}