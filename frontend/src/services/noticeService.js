import axios from "axios";

const API_URL = "http://localhost:5000/api/notices";

// Get all notices
export const getNotices = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Add a notice
export const addNotice = async (notice) => {
  const response = await axios.post(API_URL, notice);
  return response.data;
};

// Update a notice
export const updateNotice = async (id, notice) => {
  const response = await axios.put(`${API_URL}/${id}`, notice);
  return response.data;
};

// Delete a notice
export const deleteNotice = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};