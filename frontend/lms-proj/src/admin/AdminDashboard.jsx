import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // ============================
  // AUTH CHECK: ONLY ADMIN
  // ============================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];
      if (!roles.includes("Admin")) navigate("/access-denied");
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  // ============================
  // USER COUNT STATES
  // ============================
  const [userCounts, setUserCounts] = useState({
    totalUsers: 0,
    trainees: 0,
    trainers: 0,
  });

  // ============================
  // FETCH USER COUNTS
  // ============================
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/counts");
        const data = await res.json();
        setUserCounts(data);
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };
    fetchCounts();
  }, []);

  // ============================
  // HEADER COMPONENT
  // ============================
 const DashboardHeader = () => {
    const now = new Date();

    const formattedTime = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
        timeZone: 'Asia/Singapore',
    });

    return (
        <div className="row mb-4 align-items-center">
            <div className="col-md-8">
                <h2 className="fw-bold mb-0">Admin LMS Dashboard</h2>
                <div className="text-muted" style={{ fontSize: '14px' }}>
                    {formattedTime} (GMT+8)
                </div>
            </div>
        </div>
    );
};

  // ============================
  // USERS CARD
  // ============================
  const AttendanceCard = () => {
    const items = [
      { label: "Total Users", count: userCounts.totalUsers, icon: "bi-people-fill", bgColor: "#21B148" },
      { label: "Trainee", count: userCounts.trainees, icon: "bi-person-badge", bgColor: "#FF8383" },
      { label: "Trainer", count: userCounts.trainers, icon: "bi-person-video3", bgColor: "#ffc107" }
    ];

    return (
      <div className="card border-0 shadow-sm bg-white rounded p-4 mb-4">
        <h4 className="fw-semibold">Users</h4>
        <h6 className="text-muted">Batch Action 40</h6>

        <div className="row mb-4 mt-3">
          {items.map((item, index) => (
            <div key={index} className="col-md-4">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm"
                style={{ height: "100px" }}
              >
                <div>
                  <div className="fs-3 fw-bold">{item.count}</div>
                  <div className="text-muted">{item.label}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px", backgroundColor: item.bgColor }}
                >
                  <i className={`${item.icon} text-white`} style={{ fontSize: "22px" }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================
  // CHART CARD (UPDATED FOR FIXED TIME WINDOWS)
  // ============================
  const TraineeChartCard = () => {
    const [filter, setFilter] = useState("Daily");
    const [chartData, setChartData] = useState([]);
    const [loadingChart, setLoadingChart] = useState(false); 

    // 1. Fetch data whenever the filter changes
    useEffect(() => {
      const fetchChartData = async () => {
        setLoadingChart(true); 
        try {
          // Get today's date in a standard format (YYYY-MM-DD) to send to the backend
          // The backend uses this to calculate the start and end of the rolling window
          const today = new Date().toISOString().split('T')[0]; 
          
          // Pass the filter AND today's date as query parameters
          const res = await fetch(`http://localhost:5000/api/users/growth?filter=${filter}&today=${today}`);
          const data = await res.json();

          const formatted = data.map(d => ({
            date: d.date,
            trainees: Number(d.trainees),
            trainers: Number(d.trainers),
          }));

          setChartData(formatted);
        } catch (error) {
          console.error("Error fetching chart data:", error);
          setChartData([]); 
        } finally {
          setLoadingChart(false); 
        }
      };

      fetchChartData();
    }, [filter]); 

    // 2. Helper function for dynamic XAxis and Tooltip label formatting
    const getTickFormatter = (date) => {
        if (typeof date !== 'string' || date.length === 0) return date;

        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return date; 

            switch (filter) {
                case 'Daily':
                case 'Weekly': 
                    // Plots points per day in the last 7 days or current week.
                    // Format shows just the month and day (e.g., "Dec 10")
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                case 'Per Module': // Quarterly plots points per month in the current quarter
                    // Format shows month and year (e.g., "Oct 25")
                    return d.toLocaleDateString("en-US", { year: "2-digit", month: "short" });
                default:
                    return d.toLocaleDateString("en-US");
            }
        } catch (e) {
            console.error("Date formatting error:", e);
            return date; 
        }
    };


    return (
      <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-semibold">Active Users Over Time</h4>
          <select
            className="form-select"
            style={{ maxWidth: "150px" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Per Module">Per Module</option>
          </select>
        </div>

        <div className="row">
          <div className="col-12 col-md-10">
            {loadingChart ? (
                // Loading indicator
                <div className="text-center p-5 text-muted">
                    <i className="bi bi-arrow-clockwise fs-4 spin"></i> Loading Chart Data...
                </div>
            ) : chartData.length === 0 ? (
                // Empty data message
                <div className="text-center p-5 text-muted">
                    No active user data available for the "{filter}" period.
                </div>
            ) : (
                // Chart rendering
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={getTickFormatter}
                        />
                        <YAxis />
                        <Tooltip 
                            labelFormatter={getTickFormatter} // Apply formatter to Tooltip label
                        />
                        <Line type="monotone" dataKey="trainers" name="Trainer" stroke="#007bff" strokeWidth={2} />
                        <Line type="monotone" dataKey="trainees" name="Trainee" stroke="#21B148" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            )}
          </div>

          <div className="col-12 col-md-2 d-flex flex-column justify-content-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "#007bff" }}></div>
              <span className="fw-semibold">Trainer</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle" style={{ width: 16, height: 16, backgroundColor: "#21B148" }}></div>
              <span className="fw-semibold">Trainee</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================
  // RETURN UI
  // ============================
  return (
    <div className="container mt-4 pb-5">
      <DashboardHeader />
      <AttendanceCard />
      <TraineeChartCard />
    </div>
  );
}

export default AdminDashboard;