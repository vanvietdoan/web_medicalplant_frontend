export interface Disease {
    disease_id: number;
    name: string;
    description: string;
    symptoms: string;
    instructions: string;
    created_at: string;
    updated_at: string;
    images: {
        picture_id: number;
        url: string;
    }[];
}



