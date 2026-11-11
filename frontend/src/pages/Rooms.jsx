import { useState, useEffect, useCallback, useId } from "react";
import { getRooms, addRoom, updateRoom, deleteRoom } from "../services/roomService";
import "./Rooms.css";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    partiallyOccupiedRooms: 0,
    fullRooms: 0,
    maintenanceRooms: 0
  });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    floor: "",
    roomType: "All",
    status: "All"
  });

  // Form State
  const initialForm = {
    roomNumber: "",
    floor: 1,
    roomType: "Double",
    capacity: 2,
    facilities: "Study Table, WiFi, Wardrobe",
    status: "Available"
  };
  const [form, setForm] = useState(initialForm);

  // Unique IDs for form controls
  const addRoomNumberId = useId();
  const addFloorId = useId();
  const addRoomTypeId = useId();
  const addCapacityId = useId();
  const addStatusId = useId();
  const addFacilitiesId = useId();

  const editRoomNumberId = useId();
  const editFloorId = useId();
  const editRoomTypeId = useId();
  const editCapacityId = useId();
  const editStatusId = useId();
  const editFacilitiesId = useId();

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 5000);
  }, []);

  // Load rooms
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRooms(filters);
      setRooms(res.data || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to load rooms. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  }, [filters, showAlert]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditingRoom({
      ...editingRoom,
      [e.target.name]: e.target.value
    });
  };

  // Submit New Room
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addRoom({
        ...form,
        floor: Number(form.floor),
        capacity: Number(form.capacity)
      });
      showAlert("success", `Room ${form.roomNumber.toUpperCase()} added successfully!`);
      setForm(initialForm);
      setShowAddForm(false);
      loadRooms();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error adding room");
    }
  };

  // Submit Edit Room
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRoom(editingRoom._id, {
        floor: Number(editingRoom.floor),
        roomType: editingRoom.roomType,
        capacity: Number(editingRoom.capacity),
        facilities: editingRoom.facilities,
        status: editingRoom.status
      });
      showAlert("success", `Room ${editingRoom.roomNumber} updated successfully!`);
      setEditingRoom(null);
      loadRooms();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error updating room");
    }
  };

  // Delete Room
  const handleDelete = async (room) => {
    if (!window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) {
      return;
    }
    try {
      await deleteRoom(room._id);
      showAlert("success", `Room ${room.roomNumber} deleted successfully!`);
      loadRooms();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Cannot delete room");
    }
  };

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Room Management</h1>
        <p>Monitor real-time occupancy, configure hostel rooms, and maintain capacity.</p>
      </div>

      {/* Alert Notification */}
      {alert.message && (
        <div className={`alert-banner ${alert.type}`}>
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert({ type: "", message: "" })}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-title">Total Rooms</span>
          <span className="stat-value">{stats.totalRooms}</span>
        </div>
        <div className="stat-card available">
          <span className="stat-title">Available</span>
          <span className="stat-value">{stats.availableRooms}</span>
        </div>
        <div className="stat-card partial">
          <span className="stat-title">Partially Occupied</span>
          <span className="stat-value">{stats.partiallyOccupiedRooms}</span>
        </div>
        <div className="stat-card full">
          <span className="stat-title">Full</span>
          <span className="stat-value">{stats.fullRooms}</span>
        </div>
        <div className="stat-card maintenance">
          <span className="stat-title">Under Maintenance</span>
          <span className="stat-value">{stats.maintenanceRooms}</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="rooms-actions-bar">
        <h2>Hostel Rooms Listing</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "− Close Form" : "+ Add New Room"}
        </button>
      </div>

      {/* Add Room Collapsible Form */}
      {showAddForm && (
        <div className="room-form-card">
          <h2>Create New Room</h2>
          <form onSubmit={handleAddSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor={addRoomNumberId}>Room Number *</label>
                <input
                  id={addRoomNumberId}
                  type="text"
                  name="roomNumber"
                  placeholder="e.g. 101, A-203"
                  value={form.roomNumber}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={addFloorId}>Floor Number *</label>
                <input
                  id={addFloorId}
                  type="number"
                  name="floor"
                  min="0"
                  value={form.floor}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={addRoomTypeId}>Room Type *</label>
                <select
                  id={addRoomTypeId}
                  name="roomType"
                  value={form.roomType}
                  onChange={handleFormChange}
                  required
                >
                  <option value="Single">Single (1 Bed)</option>
                  <option value="Double">Double (2 Beds)</option>
                  <option value="Triple">Triple (3 Beds)</option>
                  <option value="Quad">Quad (4 Beds)</option>
                  <option value="Dormitory">Dormitory (6+ Beds)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={addCapacityId}>Total Capacity (Beds) *</label>
                <input
                  id={addCapacityId}
                  type="number"
                  name="capacity"
                  min="1"
                  value={form.capacity}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={addStatusId}>Initial Status</label>
                <select
                  id={addStatusId}
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor={addFacilitiesId}>Facilities (Comma-separated)</label>
                <input
                  id={addFacilitiesId}
                  type="text"
                  name="facilities"
                  placeholder="WiFi, Attached Bath, Study Table"
                  value={form.facilities}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Room
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Search */}
      <div className="filters-card">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Room Number or Facility..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
        />

        <select
          name="floor"
          value={filters.floor}
          onChange={handleFilterChange}
        >
          <option value="">All Floors</option>
          <option value="0">Ground Floor (0)</option>
          <option value="1">1st Floor</option>
          <option value="2">2nd Floor</option>
          <option value="3">3rd Floor</option>
          <option value="4">4th Floor</option>
        </select>

        <select
          name="roomType"
          value={filters.roomType}
          onChange={handleFilterChange}
        >
          <option value="All">All Room Types</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Triple">Triple</option>
          <option value="Quad">Quad</option>
          <option value="Dormitory">Dormitory</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Partially Occupied">Partially Occupied</option>
          <option value="Full">Full</option>
          <option value="Under Maintenance">Under Maintenance</option>
        </select>

        {(filters.search || filters.floor || filters.roomType !== "All" || filters.status !== "All") && (
          <button
            className="btn-secondary"
            onClick={() => setFilters({ search: "", floor: "", roomType: "All", status: "All" })}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Rooms Table */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">Loading hostel rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p>No rooms found matching your filter criteria.</p>
          </div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Occupancy / Capacity</th>
                <th>Facilities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const occupancyPercent = Math.min(
                  100,
                  Math.round((room.currentOccupancy / room.capacity) * 100)
                );

                const statusClass = room.status.toLowerCase().replace(/\s+/g, "-");

                return (
                  <tr key={room._id}>
                    <td>
                      <strong>{room.roomNumber}</strong>
                    </td>
                    <td>Floor {room.floor}</td>
                    <td>{room.roomType}</td>
                    <td>
                      <div className="occupancy-meter">
                        <div className="occupancy-bar">
                          <div
                            className={`occupancy-fill ${occupancyPercent >= 100 ? "full" : ""}`}
                            style={{ width: `${occupancyPercent}%` }}
                          />
                        </div>
                        <span>
                          {room.currentOccupancy} / {room.capacity} Beds
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="facilities-tags">
                        {room.facilities?.map((f, i) => (
                          <span key={i} className="facility-tag">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => setEditingRoom({
                            ...room,
                            facilities: Array.isArray(room.facilities) ? room.facilities.join(", ") : room.facilities
                          })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(room)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Room Modal */}
      {editingRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Room {editingRoom.roomNumber}</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor={editRoomNumberId}>Room Number</label>
                  <input
                    id={editRoomNumberId}
                    type="text"
                    value={editingRoom.roomNumber}
                    disabled
                    style={{ background: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={editFloorId}>Floor Number</label>
                  <input
                    id={editFloorId}
                    type="number"
                    name="floor"
                    min="0"
                    value={editingRoom.floor}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={editRoomTypeId}>Room Type</label>
                  <select
                    id={editRoomTypeId}
                    name="roomType"
                    value={editingRoom.roomType}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="Single">Single (1 Bed)</option>
                    <option value="Double">Double (2 Beds)</option>
                    <option value="Triple">Triple (3 Beds)</option>
                    <option value="Quad">Quad (4 Beds)</option>
                    <option value="Dormitory">Dormitory (6+ Beds)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={editCapacityId}>Capacity (Current Occupancy: {editingRoom.currentOccupancy})</label>
                  <input
                    id={editCapacityId}
                    type="number"
                    name="capacity"
                    min={editingRoom.currentOccupancy || 1}
                    value={editingRoom.capacity}
                    onChange={handleEditChange}
                    required
                  />
                  <small style={{ color: "#64748b" }}>
                    Cannot be lower than current occupancy ({editingRoom.currentOccupancy}).
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor={editStatusId}>Room Status</label>
                  <select
                    id={editStatusId}
                    name="status"
                    value={editingRoom.status}
                    onChange={handleEditChange}
                  >
                    <option value="Available">Available / Auto-Calculate</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={editFacilitiesId}>Facilities</label>
                  <input
                    id={editFacilitiesId}
                    type="text"
                    name="facilities"
                    value={editingRoom.facilities}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: "25px" }}>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingRoom(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rooms;
