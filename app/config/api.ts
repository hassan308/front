const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('API_URL konfigurerad som:', API_URL);

export const API_ENDPOINTS = {
  // Job endpoints
  search: `${API_URL}/api/search`,
  recommendedJobs: `${API_URL}/api/recommended-jobs`,
  analyze: `${API_URL}/api/analyze-search`,
  
  // CV endpoints
  generateCV: `${API_URL}/api/generate-cv`,
  
  // Cover letter endpoints
  generateCoverLetter: `${API_URL}/api/generate-cover-letter`,
  generateAICoverLetter: `${API_URL}/api/generate-ai-cover-letter`,
  
  // Health check
  health: `${API_URL}/health`
};