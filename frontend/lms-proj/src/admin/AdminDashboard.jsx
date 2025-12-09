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
  ReferenceLine,
  Label
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  // AUTH CHECK: Only Admin Can Enter
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const roles = decoded.roles || [];

      if (!roles.includes("Admin")) {
        navigate("/access-denied");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  }, [token, navigate]);

  // Header
  const DashboardHeader = () => (
    <div className="row mb-4">
      <h2 className="fw-bold">Admin LMS Dashboard</h2>
    </div>
  );

  // Attendance Card
  const AttendanceCard = () => {
    const items = [
      { label: "Total Users", count: 360, icon: "bi-clock", bgColor: "#21B148" },
      { label: "Trainee", count: 360, icon: "bi-clock-history", bgColor: "#FF8383" },
      { label: "Trainer", count: 360, icon: "bi-people-fill", bgColor: "#ffc107" }
    ];

    return (
      <div className="card border-0 shadow-sm bg-white rounded p-4 mb-4">
        <h4 className="fw-semibold">Users</h4>
        <h6 className="text-muted">Batch Action 40</h6>

        <div className="row mb-4">
          {items.map((it, idx) => (
            <div key={idx} className="col-md-4">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-white rounded shadow-sm"
                style={{ height: "100px" }}
              >
                <div>
                  <div className="fs-3 fw-bold">{it.count}</div>
                  <div className="text-muted">{it.label}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "60px", height: "60px", backgroundColor: it.bgColor }}
                >
                  <i className={`${it.icon} text-white`} style={{ fontSize: "20px" }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Trainee Performance Chart
  const TraineeChartCard = () => {
    const [filter, setFilter] = useState("Daily");

    const data = [
      { date: "01 Aug", philnits: 65, nihongo: 60 },
      { date: "03 Aug", philnits: 70, nihongo: 62 },
      { date: "05 Aug", philnits: 75, nihongo: 64 },
      { date: "07 Aug", philnits: 91, nihongo: 68 },
      { date: "09 Aug", philnits: 85, nihongo: 70 },
      { date: "11 Aug", philnits: 88, nihongo: 72 },
      { date: "13 Aug", philnits: 90, nihongo: 74 },
      { date: "15 Aug", philnits: 92, nihongo: 76 },
      { date: "16 Aug", philnits: 89, nihongo: 78 }
    ];

    return (
      <div className="card border-0 shadow-sm bg-white rounded p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-semibold">Trainee Performance Chart</h4>
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
          {/* Chart column */}
          <div className="col-12 col-md-10">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line
                  type="monotone"
                  dataKey="philnits"
                  name="Trainer"
                  stroke="#007bff"
                  strokeWidth={2}
                  dot={({ cx, cy, index }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={data[index].date === '07 Aug' ? 6 : 4}
                      fill="#007bff"
                    />
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="nihongo"
                  name="Trainee"
                  stroke="#21B148"
                  strokeWidth={2}
                  dot={({ cx, cy, index }) => (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={data[index].date === '07 Aug' ? 6 : 4}
                      fill="#21B148"
                    />
                  )}
                />
                <ReferenceLine x="07 Aug" stroke="#007bff" strokeDasharray="3 3">
                  <Label value="Peak: 91%" position="top" fill="#007bff" />
                </ReferenceLine>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend column */}
          <div className="col-12 col-md-2 d-flex flex-column justify-content-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{ width: '16px', height: '16px', backgroundColor: '#007bff' }}
              ></div>
              <span className="fw-semibold">Trainer</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{ width: '16px', height: '16px', backgroundColor: '#21B148' }}
              ></div>
              <span className="fw-semibold">Nihongo</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4 pb-5">
      <DashboardHeader />
      <AttendanceCard />
      <TraineeChartCard />
    </div>
  );
}

export default AdminDashboard;