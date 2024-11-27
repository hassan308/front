// Hur API:t faktiskt returnerar data
export interface APIJob {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
  };
  workplace: {
    municipality: string;
  };
  work_experiences: Array<{
    required: boolean;
    description: string;
  }>;
  work_time_extent: string;
  employment_type: string;
  published_date: string;
  last_application_date: string;
  duration: string;
  positions: number;
  salary_description: string;
  application?: {
    webAddress?: string;
    email?: string;
    reference?: string;
  };
  driving_license_required: boolean;
  own_car: boolean;
} 