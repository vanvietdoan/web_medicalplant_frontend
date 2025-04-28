export interface IDiseases {
    disease_id: number;
    name: string;
    description: string;
    symptoms: string;
    instructions: string;
    images: {
        picture_id: number;
        url: string;
    }[];
    medicinal_plants: {
        plant_id: number;
        name: string;
        english_name: string;
        image: string;
    }[];
    advice_comments: {
        advice_id: number;
        title: string;
        time: string;
        content: string;
        user: {
            full_name: string;
            title: string;
            avatar: string;
        }
    }[];
    created_at: string;
    updated_at: string;
}

export class Diseases implements IDiseases {
    disease_id: number;
    name: string;
    description: string;
    symptoms: string;
    instructions: string;
    images: {
        picture_id: number;
        url: string;
    }[];
    medicinal_plants: {
        plant_id: number;
        name: string;
        english_name: string;
        image: string;
    }[];
    advice_comments: {
        advice_id: number;
        title: string;
        time: string;
        content: string;
        user: {
            full_name: string;
            title: string;
            avatar: string;
        }
    }[];
    created_at: string;
    updated_at: string;

    constructor(data: IDiseases) {
        this.disease_id = data.disease_id;
        this.name = data.name;
        this.description = data.description;
        this.symptoms = data.symptoms;
        this.instructions = data.instructions;
        this.images = data.images;
        this.medicinal_plants = data.medicinal_plants;
        this.advice_comments = data.advice_comments;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
} 