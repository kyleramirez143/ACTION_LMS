import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./CheckpointView.css";
import { FaEdit } from "react-icons/fa";

const CheckpointView = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);

  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batchId");

  // Fetch users for this batch
  useEffect(() => {
    if (!batchId) return;

    const fetchBatchUsers = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      try {
        const res = await fetch(`http://localhost:5000/api/batches/${batchId}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        const data = await res.json();

        const formatted = data.users.map((u) => ({
          user_id: u.user_id,
          name: `${u.first_name} ${u.last_name}`,
          bpi: u.bpi_account_no,
          sss: u.sss_no,
          tin: u.tin_no,
          pagibig: u.pagibig_no,
          philhealth: u.philhealth_no,
          uaf: u.uaf_ims,
          officePC: u.office_pc_telework,
          personalPC: u.personal_pc_telework,
          passport: u.passport_ok,
          imsAwareness: u.imf_awareness_ok,
        }));

        setRows(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchUsers();
  }, [batchId]);

  // Modal helpers
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
      uaf: false,
      officePC: false,
      personalPC: false,
      passport: false,
      imsAwareness: false,
    });
    setIsAddMode(true);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFieldChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleSave = () => {
    if (isAddMode) {
      setRows([...rows, editData]);
    } else {
      const updated = [...rows];
      updated[editRowIndex] = editData;
      setRows(updated);
    }
    closeModal();
  };

  if (loading) return <p className="text-center mt-5">Loading users...</p>;

  return (
    <div className="checkpoint-container">
      <div className="checkpoint-header">
        <h2 className="checkpoint-title">
          Trainee Onboarding Checkpoint {rows[0]?.name && `- Batch Users`}
        </h2>
        <button className="add-employee-btn" onClick={openAddModal}>
          + Trainee
        </button>
      </div>

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
            {rows.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-5 text-muted">
                  No users in this batch.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.user_id}>
                  <td className="name-col">{row.name}</td>
                  <td className="payroll-cell">{row.bpi}</td>
                  <td className="hr-cell">{row.sss}</td>
                  <td className="hr-cell">{row.tin}</td>
                  <td className="hr-cell">{row.pagibig}</td>
                  <td className="hr-cell">{row.philhealth}</td>
                  <td className="telework-cell">{row.uaf ? "OK" : "Pending"}</td>
                  <td className="telework-cell">{row.officePC ? "Approved" : "Pending"}</td>
                  <td className="telework-cell">{row.personalPC ? "Approved" : "Pending"}</td>
                  <td className="passport-cell">{row.passport ? "OK" : "Pending"}</td>
                  <td className="ims-cell status-ok">{row.imsAwareness ? "OK" : "Pending"}</td>
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
            <h3>{isAddMode ? "Add Employee" : "Edit Employee"}</h3>

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
                <select
                  value={editData.uaf}
                  onChange={(e) => handleFieldChange("uaf", e.target.value === "true")}
                >
                  <option value="true">OK</option>
                  <option value="false">Pending</option>
                </select>

                <label>Office PC</label>
                <select
                  value={editData.officePC}
                  onChange={(e) => handleFieldChange("officePC", e.target.value === "true")}
                >
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>

                <label>Personal PC</label>
                <select
                  value={editData.personalPC}
                  onChange={(e) => handleFieldChange("personalPC", e.target.value === "true")}
                >
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>

                <label>Passport</label>
                <select
                  value={editData.passport}
                  onChange={(e) => handleFieldChange("passport", e.target.value === "true")}
                >
                  <option value="true">OK</option>
                  <option value="false">Pending</option>
                </select>

                <label>IMS Awareness</label>
                <select
                  value={editData.imsAwareness}
                  onChange={(e) => handleFieldChange("imsAwareness", e.target.value === "true")}
                >
                  <option value="true">OK</option>
                  <option value="false">Pending</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                {isAddMode ? "Add Employee" : "Save Changes"}
              </button>
              <button className="btn btn-outline-primary" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckpointView;
