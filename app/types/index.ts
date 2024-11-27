export interface UserData {
  displayName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string;
  experience: string;
  education: string;
  certifications: string;
  lastUpdated: number;
}

export interface WorkExperience {
  required: boolean;
  description: string;
}

export interface JobApplication {
  webAddress?: string;
  email?: string;
  reference?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
  };
  workplace: {
    municipality: string;
  };
  work_experiences: WorkExperience[];
  work_time_extent: string;
  employment_type: string;
  published_date: string;
  last_application_date: string;
  duration: string;
  positions: number;
  salary_description?: string;
  application?: JobApplication;
  driving_license_required: boolean;
  own_car: boolean;
}

export interface FilterState {
  employmentTypes: string[];
  municipalities: string[];
  experience_required: string[];
}

export interface ExperienceCount {
  [key: string]: number;
}
