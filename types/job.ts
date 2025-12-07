export interface JobSkillRelation {
    skill: {
        id: number;
        name: string;
    };
}

export interface JobWithRelations {
    id: number;
    title: string;
    createdAt: string;
    salary: string | null;

    employer: {
        companyName: string | null;
    };

    city: {
        name: string;
    } | null;

    contractType: {
        name: string;
    } | null;

    skills: JobSkillRelation[];
}


export interface JobSkill {
    skill: {
        id: number
        name: string
    }
}

export interface FeaturedJob {
    id: number
    title: string
    salary: string | null
    createdAt: string

    employer: {
        companyName: string | null
    } | null

    city: {
        name: string
    } | null

    contractType: {
        name: string
    } | null

    skills: JobSkill[]
}
