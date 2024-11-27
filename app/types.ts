// type.ts
export interface Job {
    id: string;
    title: string;
    description: string;
    employer: string;
    employmentType: string;
    workplace: {
        municipality: string;
        address?: string;
    };
    company: {
        name: string;
        description?: string;
    };
    publishedDate: string;
    lastApplicationDate?: string;
    duration?: string;
    salary?: string;
    salaryType?: string;
    positions: number;
    requiresExperience: boolean;
    logotype?: string;
    contacts?: Array<{
        description: string;
        phoneNumber?: string;
        email?: string;
    }>;
    application?: {
        webAddress?: string;
    };
}

export interface FilterState {
    employmentTypes: string[];
    municipalities: string[];
    experienceRequired: string[];
}

export interface SearchResult {
    jobs: Job[];
    total: number;
    page: number;
    pageSize: number;
}