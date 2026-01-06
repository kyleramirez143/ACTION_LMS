import React, { useState } from "react";
import "./CheckpointView.css";
import { FaEdit } from "react-icons/fa";

const initialData = [
  {
    name: "Cassandra Alyanna Co",
    bpi: "1599-7895-68",
    sss: "35-3855159-4",
    tin: "681163009",
    pagibig: "121368899097",
    philhealth: "01-252498086-8",
    uaf: "ok",
    officePC: "Approved",
    personalPC: "Approved",
    passport: "ok",
    imsAwareness: "ok",
  },
];

const CheckpointView = () => {
  const [rows, setRows] = useState(initialData);

  const handleAddEmployee = () => {
    setRows([
      ...rows,
      {
        name: "New Employee",
        bpi: "",
        sss: "",
        tin: "",
        pagibig: "",
        philhealth: "",
        uaf: "",
        officePC: "",
        personalPC: "",
        passport: "",
        imsAwareness: "",
      },
    ]);
  };

  return (
    <div className="checkpoint-container">
      {/* Header */}
      <div className="checkpoint-header">
        <h2 className="checkpoint-title">Employee Onboarding Checkpoint</h2>

        <button className="add-employee-btn" onClick={handleAddEmployee}>
          + Employee
        </button>
      </div>

      {/* Card */}
      <div className="checkpoint-card">
        <table className="checkpoint-table">
          <thead>
            <tr>
              <th className="name-col">NAME</th>
              <th className="header-green">BPI</th>
              <th className="header-purple">SSS #</th>
              <th className="header-purple">TIN #</th>
              <th className="header-purple">PAGIBIG #</th>
              <th className="header-purple">PHILHEALTH #</th>
              <th className="header-orange">UAF (IMS)</th>
              <th className="header-orange">Office PC</th>
              <th className="header-orange">Personal PC</th>
              <th className="header-yellow">Passport</th>
              <th className="header-green">IMS Awareness</th>
              <th>Edit</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="name-col">{row.name}</td>
                <td className="payroll-cell">{row.bpi}</td>
                <td className="hr-cell">{row.sss}</td>
                <td className="hr-cell">{row.tin}</td>
                <td className="hr-cell">{row.pagibig}</td>
                <td className="hr-cell">{row.philhealth}</td>
                <td className="status-ok">{row.uaf}</td>
                <td className="telework-cell">{row.officePC}</td>
                <td className="telework-cell">{row.personalPC}</td>
                <td className="passport-cell">{row.passport}</td>
                <td className="ims-cell status-ok">{row.imsAwareness}</td>
                <td>
                  <button className="edit-btn" title="Edit">
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckpointView;
