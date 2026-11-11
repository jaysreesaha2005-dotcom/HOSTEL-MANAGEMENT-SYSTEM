import axios from "axios";

const API_URL = "http://localhost:5000/api/students";

// Get all students (supports optional search)
export const getStudents = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await axios.get(`${API_URL}${query}`);
  return Array.isArray(response.data) ? response.data : (response.data.data || []);
};

// Get single student by ID
export const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data || response.data;
};

// Add a student
export const addStudent = async (studentData) => {
  const response = await axios.post(API_URL, studentData);
  return response.data;
};

// Update a student
export const updateStudent = async (id, studentData) => {
  const response = await axios.put(`${API_URL}/${id}`, studentData);
  return response.data;
};

// Delete a student
export const deleteStudent = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
