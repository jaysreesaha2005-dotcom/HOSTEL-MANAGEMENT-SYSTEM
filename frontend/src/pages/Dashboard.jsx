
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { getDashboardStats } from "../services/dashboardService";
import "./Dashboard.css";

const COLORS = ["#1559b7", "#f59e0b", "#16a34a"];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard. Check your backend server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-page">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">{error}</div>
        <button
          className="dashboard-refresh"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "🎓",
    },
    {
      title: "Total Rooms",
      value: stats.totalRooms,
      icon: "🏠",
    },
    {
      title: "Occupied Rooms",
      value: stats.occupiedRooms,
      icon: "🛏️",
    },
    {
      title: "Available Rooms",
      value: stats.availableRooms,
      icon: "🔑",
    },
    {
      title: "Pending Complaints",
      value: stats.pendingComplaints,
      icon: "⚠️",
    },
    {
      title: "Total Notices",
      value: stats.totalNotices ?? 0,
      icon: "📢",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of HostelHub management statistics.</p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div className="dashboard-card" key={card.title}>
            <div className="dashboard-card-icon">{card.icon}</div>
            <div>
              <p>{card.title}</p>
              <h2>{card.value ?? 0}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <section className="chart-card">
          <h2>Complaint Status</h2>
          {stats.complaintStats?.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.complaintStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {stats.complaintStats.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">No complaint data available.</p>
          )}
        </section>

        <section className="chart-card">
          <h2>Room Availability</h2>
          {stats.roomStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.roomStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Rooms" fill="#1559b7" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">No room data available.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
