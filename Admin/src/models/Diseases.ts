export class Disease {
    disease_id: number;
    name: string;
    description: string;
    symptoms: string;

    constructor(
        disease_id: number,
        name: string,
        description: string,
        symptoms: string
    ) {
        this.disease_id = disease_id;
        this.name = name;
        this.description = description;
        this.symptoms = symptoms;
    }
}

