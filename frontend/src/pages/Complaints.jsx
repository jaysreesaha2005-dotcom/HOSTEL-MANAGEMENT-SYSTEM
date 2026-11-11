import "./Complaints.css";
import { useEffect, useState } from "react";
import {
  getComplaints,
  addComplaint,
  deleteComplaint
} from "../services/complaintService";

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    registrationNumber: "",
    category: "Electricity",
    title: "",
    description: ""
  });

  // Load complaints from the database
  const loadComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch {
      setMessage("Could not load complaints. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Update form values
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  // Submit a new complaint
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await addComplaint(form);

      setMessage("Complaint submitted successfully!");

      setForm({
        studentName: "",
        registrationNumber: "",
        category: "Electricity",
        title: "",
        description: ""
      });

      loadComplaints();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to submit complaint."
      );
    }
  };

  // Delete a complaint
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      await deleteComplaint(id);
      setMessage("Complaint deleted successfully!");
      loadComplaints();
    } catch {
      setMessage("Could not delete complaint.");
    }
  };

  return (
    <div className="complaints-page">
      <h1>Complaint Management</h1>
      <p>Submit and manage hostel complaints here.</p>

      {message && <p>{message}</p>}

      <h2>Submit a Complaint</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={form.studentName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="registrationNumber"
          placeholder="Registration Number"
          value={form.registrationNumber}
          onChange={handleChange}
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option>Electricity</option>
          <option>Water</option>
          <option>Cleaning</option>
          <option>Furniture</option>
          <option>Other</option>
        </select>

        <input
          type="text"
          name="title"
          placeholder="Complaint Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Describe your complaint"
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Complaint</button>
      </form>

      <h2>All Complaints</h2>

      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints found. Submit your first complaint above.</p>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint._id} className="complaint-card">
            <h3>{complaint.title}</h3>
            <p><b>Student:</b> {complaint.studentName}</p>
            <p><b>Registration:</b> {complaint.registrationNumber}</p>
            <p><b>Category:</b> {complaint.category}</p>
            <p><b>Description:</b> {complaint.description}</p>
            <p><b>Status:</b> {complaint.status}</p>

            <button onClick={() => handleDelete(complaint._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Complaints;
