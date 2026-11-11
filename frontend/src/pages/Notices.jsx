import "./Notices.css";
import { useEffect, useState } from "react";

import {
  getNotices,
  addNotice,
  updateNotice,
  deleteNotice
} from "../services/noticeService";

function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: ""
  });

  // Load notices from MongoDB
  const loadNotices = async () => {
    try {
      const data = await getNotices();
      setNotices(data);
    } catch {
      setMessage("Could not load notices. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Handle form input
  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  // Add or update notice
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateNotice(editingId, form);
        setMessage("Notice updated successfully!");
      } else {
        await addNotice(form);
        setMessage("Notice published successfully!");
      }

      setForm({
        title: "",
        description: ""
      });

      setEditingId(null);
      await loadNotices();

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not save notice."
      );
    }
  };

  // Edit notice
  const handleEdit = (notice) => {
    setForm({
      title: notice.title,
      description: notice.description
    });

    setEditingId(notice._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const handleCancel = () => {
    setForm({
      title: "",
      description: ""
    });

    setEditingId(null);
    setMessage("");
  };

  // Delete notice
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) {
      return;
    }

    try {
      await deleteNotice(id);
      setMessage("Notice deleted successfully!");
      await loadNotices();
    } catch {
      setMessage("Could not delete notice.");
    }
  };

  // Search notices
  const filteredNotices = notices.filter((notice) => {
    const searchText = search.toLowerCase();

    return (
      notice.title.toLowerCase().includes(searchText) ||
      notice.description.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="notices-page">

      <h1>Notice Board Management</h1>
      <p>Publish and manage important hostel announcements.</p>

      {message && <p className="notice-message">{message}</p>}

      <h2>{editingId ? "Edit Notice" : "Publish New Notice"}</h2>

      <form className="notice-form" onSubmit={handleSubmit}>

        <input
          type="text"
          name="title"
          placeholder="Notice Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Write your notice here..."
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">
          {editingId ? "Update Notice" : "Publish Notice"}
        </button>

        {editingId && (
          <button type="button" onClick={handleCancel}>
            Cancel Editing
          </button>
        )}

      </form>

      <h2>All Hostel Notices</h2>

      <input
        className="notice-search"
        type="text"
        placeholder="Search notices..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {loading ? (
        <p>Loading notices...</p>
      ) : filteredNotices.length === 0 ? (
        <p>No notices found.</p>
      ) : (
        filteredNotices.map((notice) => (
          <div className="notice-card" key={notice._id}>

            <h3>{notice.title}</h3>

            <p>{notice.description}</p>

            <small>
              Published: {new Date(notice.date).toLocaleDateString()}
            </small>

            <div className="notice-actions">

              <button onClick={() => handleEdit(notice)}>
                Edit
              </button>

              <button onClick={() => handleDelete(notice._id)}>
                Delete
              </button>

            </div>

          </div>
        ))
      )}

    </div>
  );
}

export default Notices;
