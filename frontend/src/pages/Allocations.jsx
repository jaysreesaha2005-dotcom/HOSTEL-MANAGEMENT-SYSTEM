import { useState, useEffect, useCallback, useId } from "react";
import { getStudents } from "../services/studentService";
import { getRooms } from "../services/roomService";
import { getAllocations, createAllocation, vacateAllocation } from "../services/allocationService";
import "./Allocations.css";

function Allocations() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [remarks, setRemarks] = useState("");

  // Unique IDs for form controls
  const studentSelectId = useId();
  const roomSelectId = useId();
  const remarksId = useId();

  // Filters
  const [statusTab, setStatusTab] = useState("Active"); // "Active" | "All" | "Vacated"
  const [search, setSearch] = useState("");

  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 6000);
  }, []);

  // Load all required data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsData, roomsData, allocationsData] = await Promise.all([
        getStudents(),
        getRooms(),
        getAllocations({ status: statusTab, search })
      ]);

      setStudents(studentsData || []);
      setRooms(roomsData.data || []);
      setAllocations(allocationsData || []);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to load allocation data.");
    } finally {
      setLoading(false);
    }
  }, [statusTab, search, showAlert]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Find currently selected student object
  const selectedStudent = students.find((s) => s._id === selectedStudentId);

  // Filter available rooms with remaining capacity and not under maintenance
  const availableRooms = rooms.filter(
    (r) => r.status !== "Under Maintenance" && r.currentOccupancy < r.capacity
  );

  // Handle Allocate Submission
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudentId || !selectedRoomId) {
      showAlert("error", "Please select both a student and an available room.");
      return;
    }

    try {
      await createAllocation({
        studentId: selectedStudentId,
        roomId: selectedRoomId,
        remarks
      });

      showAlert("success", "Room allocated successfully!");
      setSelectedStudentId("");
      setSelectedRoomId("");
      setRemarks("");
      loadData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to allocate room.");
    }
  };

  // Handle Vacate Room
  const handleVacate = async (allocation) => {
    const studentName = allocation.student?.name || "the student";
    const roomNumber = allocation.room?.roomNumber || "the room";

    if (!window.confirm(`Are you sure you want to vacate Room ${roomNumber} for ${studentName}?`)) {
      return;
    }

    try {
      await vacateAllocation(allocation._id, "Vacated upon checkout request");
      showAlert("success", `Room ${roomNumber} successfully vacated for ${studentName}!`);
      loadData();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Could not vacate room.");
    }
  };

  return (
    <div className="allocations-page">
      <div className="allocations-header">
        <h1>Room Allocation</h1>
        <p>Assign hostel rooms to students, track active room assignments, and manage releases.</p>
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

      {/* Allocate Room Form Card */}
      <div className="allocation-form-card">
        <h2>Allocate Room to Enrolled Student</h2>
        <form onSubmit={handleAllocateSubmit}>
          <div className="allocation-form-grid">
            {/* Student Dropdown */}
            <div className="form-group">
              <label htmlFor={studentSelectId}>Select Student *</label>
              <select
                id={studentSelectId}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
              >
                <option value="">-- Choose Student from Records --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.registrationNumber} - {student.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Dropdown (Available beds only) */}
            <div className="form-group">
              <label htmlFor={roomSelectId}>Select Available Room *</label>
              <select
                id={roomSelectId}
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
              >
                <option value="">-- Choose Available Room --</option>
                {availableRooms.map((room) => {
                  const remaining = room.capacity - room.currentOccupancy;
                  return (
                    <option key={room._id} value={room._id}>
                      Room {room.roomNumber} (Floor {room.floor} - {room.roomType} - {remaining} bed{remaining > 1 ? "s" : ""} free)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label htmlFor={remarksId}>Allocation Remarks / Notes</label>
              <input
                id={remarksId}
                type="text"
                placeholder="e.g. Regular semester allocation"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          {/* Student Info Display Preview */}
          {selectedStudent && (
            <div className="student-info-preview">
              <div className="student-info-item">
                <span>Student Name</span>
                <strong>{selectedStudent.name}</strong>
              </div>
              <div className="student-info-item">
                <span>Registration No.</span>
                <strong>{selectedStudent.registrationNumber}</strong>
              </div>
              <div className="student-info-item">
                <span>Department</span>
                <strong>{selectedStudent.department} (Year {selectedStudent.year})</strong>
              </div>
              <div className="student-info-item">
                <span>Contact Phone</span>
                <strong>{selectedStudent.phone || "N/A"}</strong>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary">
            Confirm Room Allocation
          </button>
        </form>
      </div>

      {/* Control Bar: View Tabs and Search */}
      <div className="allocations-controls">
        <div className="view-tabs">
          <button
            className={`tab-btn ${statusTab === "Active" ? "active" : ""}`}
            onClick={() => setStatusTab("Active")}
          >
            Active Allocations
          </button>
          <button
            className={`tab-btn ${statusTab === "Vacated" ? "active" : ""}`}
            onClick={() => setStatusTab("Vacated")}
          >
            Vacated / History
          </button>
          <button
            className={`tab-btn ${statusTab === "All" ? "active" : ""}`}
            onClick={() => setStatusTab("All")}
          >
            All Records
          </button>
        </div>

        <div className="filter-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search by student, reg no, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Allocations Table */}
      <div className="allocations-table-card">
        {loading ? (
          <div className="empty-state">Loading allocation records...</div>
        ) : allocations.length === 0 ? (
          <div className="empty-state">
            <p>No allocation records found.</p>
          </div>
        ) : (
          <table className="allocations-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration No.</th>
                <th>Room Allocated</th>
                <th>Floor & Type</th>
                <th>Allocation Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((item) => {
                const allocDate = item.allocatedDate
                  ? new Date(item.allocatedDate).toLocaleDateString()
                  : "N/A";
                const vacateDate = item.vacatedDate
                  ? new Date(item.vacatedDate).toLocaleDateString()
                  : null;

                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{item.student?.name || "Unknown Student"}</strong>
                      <br />
                      <small style={{ color: "#64748b" }}>{item.student?.department}</small>
                    </td>
                    <td>{item.student?.registrationNumber || "N/A"}</td>
                    <td>
                      <strong>Room {item.room?.roomNumber || "N/A"}</strong>
                    </td>
                    <td>
                      Floor {item.room?.floor !== undefined ? item.room.floor : "N/A"} ({item.room?.roomType || "N/A"})
                    </td>
                    <td>
                      {allocDate}
                      {vacateDate && (
                        <div>
                          <small style={{ color: "#64748b" }}>Vacated: {vacateDate}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {item.status === "Active" ? (
                        <button
                          className="btn-vacate"
                          onClick={() => handleVacate(item)}
                        >
                          Vacate Room
                        </button>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Allocations;
