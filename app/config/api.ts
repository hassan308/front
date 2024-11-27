const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  search: `${API_URL}/search`,
  generateCV: `${API_URL}/generate_cv`,
  recommendedJobs: `${API_URL}/recommended-jobs`,
  analyze: `${API_URL}/analyze-search`  // Uppdaterat namn för att matcha backend
};