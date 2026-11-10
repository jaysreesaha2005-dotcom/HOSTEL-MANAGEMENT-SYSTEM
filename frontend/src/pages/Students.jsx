
import { useEffect, useState } from "react";
import {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../services/studentService";
import "./Students.css";

const emptyForm = {
  name: "",
  registrationNumber: "",
  email: "",
  phone: "",
  course: "",
  year: "",
  roomNumber: "",
  guardianName: "",
  guardianPhone: "",
  status: "Active",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateStudent(editingId, form);
        setMessage("Student updated successfully!");
      } else {
        await addStudent(form);
        setMessage("Student registered successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save student.");
    }
  };

  const handleEdit = (student) => {
    setForm({
      name: student.name || "",
      registrationNumber: student.registrationNumber || "",
      email: student.email || "",
      phone: student.phone || "",
      course: student.course || "",
      year: student.year || "",
      roomNumber: student.roomNumber || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      status: student.status || "Active",
    });

    setEditingId(student._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      await deleteStudent(id);
      setMessage("Student deleted successfully!");
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete student.");
    }
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const filteredStudents = students.filter((student) =>
    [
      student.name,
      student.registrationNumber,
      student.email,
      student.course,
      student.roomNumber,
      student.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="member54-page">
      <div className="page-heading">
        <div>
          <h1>Student Management</h1>
          <p>Register and manage hostel students.</p>
        </div>
        <span className="student-count">
          Total Students: {students.length}
        </span>
      </div>

      {error && <div className="alert error-alert">{error}</div>}
      {message && <div className="alert success-alert">{message}</div>}

      <section className="student-form-card">
        <h2>{editingId ? "Edit Student" : "Register New Student"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="student-form-grid">
            <label>
              Full Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </label>

            <label>
              Registration Number *
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                required
                placeholder="Enter registration number"
              />
            </label>

            <label>
              Email *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </label>

            <label>
              Phone *
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
              />
            </label>

            <label>
              Course *
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                required
                placeholder="Enter course"
              />
            </label>

            <label>
              Year *
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </label>

            <label>
              Room Number
              <input
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
                placeholder="Example: A-101"
              />
            </label>

            <label>
              Guardian Name
              <input
                name="guardianName"
                value={form.guardianName}
                onChange={handleChange}
                placeholder="Enter guardian name"
              />
            </label>

            <label>
              Guardian Phone
              <input
                name="guardianPhone"
                value={form.guardianPhone}
                onChange={handleChange}
                placeholder="Enter guardian phone"
              />
            </label>

            <label>
              Status
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-btn">
              {editingId ? "Update Student" : "Register Student"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="student-list-card">
        <div className="list-heading">
          <h2>Student Records</h2>
          <input
            className="search-input"
            placeholder="Search by name, ID, course or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="empty-message">No student records found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Registration No.</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.registrationNumber}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.course}</td>
                    <td>{student.year}</td>
                    <td>{student.roomNumber || "Not assigned"}</td>
                    <td>
                      <span
                        className={`status-badge status-${(
                          student.status || "Active"
                        ).toLowerCase()}`}
                      >
                        {student.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Students;
