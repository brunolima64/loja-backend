export type NewAdType = {
    idUser: string;
    state: string;
    category: string;
    images: {
        url: string;
        default: boolean;
    }[];
    dateCreated: Date;
    title: string;
    price: number;
    priceNegotiable: boolean;
    description?: string;
    views?: number;
    status: string;
}