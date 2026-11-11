import axios from "axios";

const API_URL = "http://localhost:5000/api/rooms";

// Get all rooms with optional filtering
export const getRooms = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.floor !== undefined && filters.floor !== "") params.append("floor", filters.floor);
  if (filters.roomType && filters.roomType !== "All") params.append("roomType", filters.roomType);
  if (filters.status && filters.status !== "All") params.append("status", filters.status);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(`${API_URL}${queryString}`);
  return response.data;
};

// Get single room details with active occupants
export const getRoomById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

// Add a new room
export const addRoom = async (roomData) => {
  const response = await axios.post(API_URL, roomData);
  return response.data;
};

// Update room
export const updateRoom = async (id, roomData) => {
  const response = await axios.put(`${API_URL}/${id}`, roomData);
  return response.data;
};

// Delete room
export const deleteRoom = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Get room summary stats
export const getRoomStats = async () => {
  const response = await axios.get(`${API_URL}/stats/summary`);
  return response.data.data;
};

