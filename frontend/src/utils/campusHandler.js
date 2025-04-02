import { api } from './api';

export const getCampuses = async () => {
  try {
    const response = await api.get('/campuses');
    return response.data;
  } catch (error) {
    console.error('Error fetching campuses:', error);
    throw error;
  }
};
