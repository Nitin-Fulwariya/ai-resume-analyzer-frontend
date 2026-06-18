import axios from 'axios';

// Users can specify the live Render URL by creating a .env file and setting VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const analyzeResume = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_description', jobDescription);

  const response = await axios.post(`${API_BASE_URL}/analyze/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
