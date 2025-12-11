export interface Country {
    id: number
    name: string
}

export interface City {
    id: number
    name: string
    countryId: number
}

export interface ContractType {
    id: number
    name: string
}

export interface Skill {
    id: number
    name: string
    contextId: number
}

export interface SkillContext {
    id: number
    name: string
    skills: Skill[]
}
