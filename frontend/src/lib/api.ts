import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  uploadPaper: async (formData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/papers/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getPaper: async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/papers/${id}`);
    return response.data;
  },

  createChatSession: async (paperId: string) => {
    const response = await axios.post(`${API_BASE_URL}/chat/session`, { paperId });
    return response.data;
  },

  sendChatMessage: async (chatId: string, message: string) => {
    const response = await axios.post(`${API_BASE_URL}/chat/message`, { chatId, message });
    return response.data;
  },

  generateCitation: async (paperId: string, style: string) => {
    const response = await axios.post(`${API_BASE_URL}/citations/generate`, { paperId, style });
    return response.data;
  }
};