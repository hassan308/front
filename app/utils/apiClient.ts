import { auth } from '../firebase/firebaseConfig';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Lägg till auth headers om det behövs
        ...(auth.currentUser && { 
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        })
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  },

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth.currentUser && { 
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        })
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  }
}; 