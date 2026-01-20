import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FaEdit, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./CheckpointView.css";


const backendURL = "http://localhost:5000";


const CheckpointView = () => {
  const { state } = useLocation();
  const batchId = state?.batchId;


  const [batchInfo, setBatchInfo] = useState({ name: "", location: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);


  const fetchData = useCallback(async () => {
    if (!batchId) return;
    const token = localStorage.getItem("authToken");
   
    try {
      setLoading(true);


      const batchRes = await fetch(`${backendURL}/api/batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatchInfo({ name: bData.name, location: bData.location });
      }


      const traineeRes = await fetch(`${backendURL}/api/checkpoints/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
     
      if (!traineeRes.ok) throw new Error("Failed to fetch batch trainees");
      const traineeData = await traineeRes.json();
      setRows(Array.isArray(traineeData) ? traineeData : []);


    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [batchId]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const openEditModal = (trainee) => {
    setEditData({ ...trainee });
    setShowModal(true);
  };


  const handleFieldChange = (field, value) => {
    const val = value === "true" ? true : value === "false" ? false : value;
    setEditData((prev) => ({ ...prev, [field]: val }));
  };


  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    setSaving(true);
   
    try {
      const res = await fetch(`${backendURL}/api/checkpoints/${editData.user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });


      if (res.ok) {
        await fetchData();
        setShowModal(false);
      } else {
        alert("Update failed.");
      }
    } catch (err) {
      console.error("Save Error:", err);
    } finally {
      setSaving(false);
    }
  };


  const StatusIcon = ({ value }) => (
    value ? <FaCheckCircle className="text-success" /> : <FaTimesCircle className="text-danger" />
  );


  if (!batchId) return <div className="p-5 text-center">No Batch selected.</div>;


  return (
    <div className="user-role-card">
      {/* Table */}
      <div className="checkpoint-header">
        <h3 className="section-title">
          {batchName ? `${batchName} : Checkpoint` : "Trainee Onboarding Checkpoint"}
        </h3>
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


{showModal && (
  <div className="modal-overlay">
    <div className="modal-content admin-modal">
      <div className="modal-header-section">
        <h3 className="modal-title">Edit Onboarding Details</h3>
        <p className="modal-subtitle">{editData.first_name} {editData.last_name}</p>
      </div>
     
      <div className="modal-body">
  <div className="modal-two-column-layout">
   
    {/* LEFT SIDE: Government & Financials */}
    <div className="modal-left-side">
      <div className="modal-section-title">Government & Financials</div>
      <div className="form-group">
        <label>BPI Account No.</label>
        <input type="text" placeholder="0000-0000-00" value={editData.bpi_account_no || ""} onChange={(e) => handleFieldChange("bpi_account_no", e.target.value)} />
      </div>
      <div className="form-group">
        <label>SSS Number</label>
        <input type="text" placeholder="00-0000000-0" value={editData.sss_no || ""} onChange={(e) => handleFieldChange("sss_no", e.target.value)} />
      </div>
      <div className="form-group">
        <label>TIN Number</label>
        <input type="text" placeholder="000-000-000" value={editData.tin_no || ""} onChange={(e) => handleFieldChange("tin_no", e.target.value)} />
      </div>
      <div className="form-group">
        <label>PAGIBIG</label>
        <input type="text" placeholder="0000-0000-0000" value={editData.pagibig_no || ""} onChange={(e) => handleFieldChange("pagibig_no", e.target.value)} />
      </div>
      <div className="form-group">
        <label>PhilHealth</label>
        <input type="text" placeholder="00-000000000-0" value={editData.philhealth_no || ""} onChange={(e) => handleFieldChange("philhealth_no", e.target.value)} />
      </div>
    </div>


    {/* VERTICAL DIVIDER (Optional) */}
    <div className="modal-divider"></div>


    {/* RIGHT SIDE: Dropdown Checklist */}
    <div className="modal-right-side">
      <div className="modal-section-title">Requirement Checklist</div>
      <div className="form-group">
        <label>UAF (IMS)</label>
        <select className={editData.uaf_ims ? "select-completed" : "select-pending"} value={String(editData.uaf_ims)} onChange={(e) => handleFieldChange("uaf_ims", e.target.value === "true")}>
          <option value="false">Pending</option>
          <option value="true">Completed</option>
        </select>
      </div>
      <div className="form-group">
        <label>Telework (Office PC)</label>
        <select className={editData.office_pc_telework ? "select-completed" : "select-pending"} value={String(editData.office_pc_telework)} onChange={(e) => handleFieldChange("office_pc_telework", e.target.value === "true")}>
          <option value="false">Pending</option>
          <option value="true">Approved</option>
        </select>
      </div>
      <div className="form-group">
        <label>Telework (Personal PC)</label>
        <select className={editData.personal_pc_telework ? "select-completed" : "select-pending"} value={String(editData.personal_pc_telework)} onChange={(e) => handleFieldChange("personal_pc_telework", e.target.value === "true")}>
          <option value="false">Pending</option>
          <option value="true">Approved</option>
        </select>
      </div>
      <div className="form-group">
        <label>Passport</label>
        <select className={editData.passport_ok ? "select-completed" : "select-pending"} value={String(editData.passport_ok)} onChange={(e) => handleFieldChange("passport_ok", e.target.value === "true")}>
          <option value="false">None</option>
          <option value="true">Ok</option>
        </select>
      </div>
      <div className="form-group">
        <label>IMF & UAF</label>
        <select className={editData.imf_awareness_ok ? "select-completed" : "select-pending"} value={String(editData.imf_awareness_ok)} onChange={(e) => handleFieldChange("imf_awareness_ok", e.target.value === "true")}>
          <option value="false">Pending</option>
          <option value="true">Done</option>
        </select>
      </div>
    </div>


  </div>
</div>


      <div className="modal-footer">
        <button className="btn-save-modern" onClick={handleSave} disabled={saving}>
          {saving ? "Saving Changes..." : "Save"}
        </button>
        <button className="btn-cancel-modern" onClick={() => setShowModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};


export default CheckpointView;
