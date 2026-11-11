import axios from "axios";

const API_URL = "http://localhost:5000/api/students";

// Get all students
export const getStudents = async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await axios.get(`${API_URL}${query}`);
  return response.data.data;
};

// Get single student by ID
export const getStudentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

// Add a student
export const addStudent = async (studentData) => {
  const response = await axios.post(API_URL, studentData);
  return response.data;
};

