import axios from "axios";

const API_URL = "http://localhost:5000/api/complaints";

// Get all complaints
export const getComplaints = async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Add a new complaint
export const addComplaint = async (complaint) => {
  const response = await axios.post(API_URL, complaint);
  return response.data;
};

// Update complaint
export const updateComplaint = async (id, complaint) => {
  const response = await axios.put(`${API_URL}/${id}`, complaint);
  return response.data;
};

// Delete complaint
export const deleteComplaint = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
