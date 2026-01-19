import React, { useState, useEffect } from "react";
import "./CheckpointView.css";
import { FaEdit } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const CheckpointView = () => {
  const location = useLocation();
  const { batchId, batchName } = location.state || {};

  const [rows, setRows] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  // Fetch trainees for the selected batch
  useEffect(() => {
    if (!batchId) return;
    const fetchTrainees = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const res = await fetch(
          `http://localhost:5000/api/checkpoints/${batchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch checkpoint data");

        const data = await res.json();
        setRows(data.employees || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrainees();
  }, [batchId]);

  // Modal functions (unchanged)
  const openModal = (index) => {
    setEditRowIndex(index);
    setEditData({ ...rows[index] });
    setIsAddMode(false);
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditData({
      name: "",
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
    });
    setIsAddMode(true);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = () => {
    if (isAddMode) setRows([...rows, editData]);
    else {
      const updated = [...rows];
      updated[editRowIndex] = editData;
      setRows(updated);
    }
    closeModal();
  };

  return (
    <div className="checkpoint-container">
      {/* Table */}
      <div className="checkpoint-card">
        <div className="checkpoint-header">
          <h2 className="checkpoint-title">
            {batchName ? `Checkpoint for ${batchName}` : "Trainee Onboarding Checkpoint"}
          </h2>
          <button className="add-employee-btn" onClick={openAddModal}>+ Trainee</button>
        </div>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-5 text-muted">
                  No trainees found for this batch.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="name-col">{row.name}</td>
                  <td className="payroll-cell">{row.bpi}</td>
                  <td className="hr-cell">{row.sss}</td>
                  <td className="hr-cell">{row.tin}</td>
                  <td className="hr-cell">{row.pagibig}</td>
                  <td className="hr-cell">{row.philhealth}</td>
                  <td className="telework-cell">{row.uaf}</td>
                  <td className="telework-cell">{row.officePC}</td>
                  <td className="telework-cell">{row.personalPC}</td>
                  <td className="passport-cell">{row.passport}</td>
                  <td className="ims-cell status-ok">{row.imsAwareness}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(idx)}>
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content fixed-modal">
            <h3>{isAddMode ? "Add Trainee" : "Edit Trainee"}</h3>

            <div className="two-column-form">
              <div className="form-column">
                <label>Name</label>
                <input value={editData.name} onChange={(e) => handleFieldChange("name", e.target.value)} />
                <label>BPI</label>
                <input value={editData.bpi} onChange={(e) => handleFieldChange("bpi", e.target.value)} />
                <label>SSS #</label>
                <input value={editData.sss} onChange={(e) => handleFieldChange("sss", e.target.value)} />
                <label>TIN #</label>
                <input value={editData.tin} onChange={(e) => handleFieldChange("tin", e.target.value)} />
                <label>PAGIBIG #</label>
                <input value={editData.pagibig} onChange={(e) => handleFieldChange("pagibig", e.target.value)} />
              </div>
              <div className="form-column">
                <label>PHILHEALTH #</label>
                <input value={editData.philhealth} onChange={(e) => handleFieldChange("philhealth", e.target.value)} />
                <label>UAF (IMS)</label>
                <input value={editData.uaf} onChange={(e) => handleFieldChange("uaf", e.target.value)} />
                <label>Office PC</label>
                <input value={editData.officePC} onChange={(e) => handleFieldChange("officePC", e.target.value)} />
                <label>Personal PC</label>
                <input value={editData.personalPC} onChange={(e) => handleFieldChange("personalPC", e.target.value)} />
                <label>Passport</label>
                <input value={editData.passport} onChange={(e) => handleFieldChange("passport", e.target.value)} />
                <label>IMS Awareness</label>
                <input value={editData.imsAwareness} onChange={(e) => handleFieldChange("imsAwareness", e.target.value)} />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                {isAddMode ? "Add Trainee" : "Save Changes"}
              </button>
              <button className="btn btn-outline-primary" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckpointView;
