export interface Advice {
    advice_id: number;
    created_at: string;
    updated_at: string;
    title: string;
    content: string;
    instructions: string;
    plant: {
        plant_id: number;
        name: string;
    };
    disease: {
        disease_id: number;
        name: string;
    };
    user: {
        user_id: number;
        full_name: string;
        title: string;
    };
}

export class Advice implements Advice {
    advice_id: number;
    created_at: string;
    updated_at: string;
    title: string;
    content: string;
    plant:{
        plant_id: number;
        name: string;
    };
    disease: {
        disease_id: number;
        name: string;
    };
    user: {
        user_id: number;
        full_name: string;
        title: string;
    };

    constructor(data: Advice) {
        this.advice_id = data.advice_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.title = data.title;
        this.content = data.content;
        this.plant = data.plant;
        this.disease = data.disease;
        this.user = data.user;
    }

    static createDefault(): Advice {
        return {
            advice_id: 0,
            title: '',
            content: '',
            instructions: '',
            plant: {
                plant_id: 0,
                name: ''
            },
            disease: {
                disease_id: 0,
                name: ''
            },
            user: {
                user_id: 0,
                full_name: '',
                title: ''
            },
            created_at: '',
            updated_at: ''
        }
    }
} 