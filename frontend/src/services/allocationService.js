import axios from "axios";

const API_URL = "http://localhost:5000/api/allocations";

// Get all allocations (with optional status & search)
export const getAllocations = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "All") params.append("status", filters.status);
  if (filters.search) params.append("search", filters.search);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const response = await axios.get(`${API_URL}${queryString}`);
  return response.data.data;
};

// Get single allocation
export const getAllocationById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

// Create a new allocation
export const createAllocation = async (allocationData) => {
  const response = await axios.post(API_URL, allocationData);
  return response.data;
};

// Vacate an allocation
export const vacateAllocation = async (id, remarks = "") => {
  const response = await axios.patch(`${API_URL}/${id}/vacate`, { remarks });
  return response.data;
};

