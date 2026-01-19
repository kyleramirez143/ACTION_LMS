import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserRoleTable.css";

function ModuleTable() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // --- State Management ---
    const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: "", start_date: "", end_date: "" });

    // Fixed: Standardized variable name
    const [selectedModules, setSelectedModules] = useState([]);

    const fetchPeriods = useCallback(async () => {
        // 1. If no valid ID is present, stop loading and clear periods
        if (!selectedCurriculumId || selectedCurriculumId === "null" || selectedCurriculumId === "") {
            setPeriods([]);
            setLoading(false); // Make sure this is false!
            return;
        }

        setLoading(true);
        console.log("Fetching periods for Curriculum ID:", selectedCurriculumId);

        try {
            const res = await fetch(`http://localhost:5000/api/quarters/batch/${selectedCurriculumId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error(`Server responded with ${res.status}`);
            }

            const data = await res.json();
            console.log("Data received:", data);

            setPeriods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch periods error:", err);
            setPeriods([]);
        } finally {
            setLoading(false); // This ensures "Loading..." disappears
        }
    }, [selectedCurriculumId, token]);

    // 1. Fetch Batches
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (Array.isArray(data)) {
                    setBatches(data);

                    // FIX: If no batch is selected yet, find the first one that HAS a curriculum
                    if (!selectedCurriculumId) {
                        const firstValid = data.find(b => b.curriculum_id !== null);
                        if (firstValid) {
                            setSelectedCurriculumId(String(firstValid.curriculum_id));
                        }
                    }
                }
            } catch (err) {
                console.error("Batch fetch error:", err);
            }
        };
        fetchBatches();
    }, [token]);

    useEffect(() => {
        fetchPeriods();
        setSelectedModules([]);
    }, [fetchPeriods]);

    // --- Helpers ---
    const filteredPeriods = periods.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(searchLower) ||
            p.start_date.toLowerCase().includes(searchLower) ||
            p.end_date.toLowerCase().includes(searchLower)
        );
    });

    const handleCheckboxChange = (id) => {
        setSelectedModules(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            // Select only the modules currently visible in the filtered list
            const allIds = filteredPeriods.map(p => p.quarter_id);
            setSelectedModules(allIds);
        } else {
            setSelectedModules([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedModules.length === 0) return;
        if (!window.confirm(`Delete ${selectedModules.length} modules?`)) return;

        try {
            const res = await fetch("http://localhost:5000/api/periods/bulk-delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ periodIds: selectedModules }),
            });
            if (res.ok) {
                fetchPeriods();
                setSelectedModules([]);
            }
        } catch (err) { alert(err.message); }
    };

    const handleEditClick = (period) => {
        setEditingId(period.quarter_id);
        setEditData({
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date
        });
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    const handleSave = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/periods/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                setEditingId(null);
                fetchPeriods(); // Refresh the table
            } else {
                alert("Failed to update module.");
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    // Dynamic Title Logic
    const currentBatch = batches.find(b => String(b.curriculum_id) === String(selectedCurriculumId));
    const dynamicTitle = currentBatch
        ? `${currentBatch.name} ${currentBatch.location} - Module Period`
        : "Module Management";

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title"> {dynamicTitle}</h3>
                <div className="d-flex gap-2">
                    <Link to="/admin/set-module-date">
                        <button className="btn btn-primary rounded-pill">
                            <i className="bi bi-calendar-check-fill"></i> Set Module Period
                        </button>
                    </Link>

                    {/* Fixed: Reference correct state variable name here */}
                    <button
                        className="btn btn-danger rounded-pill"
                        onClick={handleBulkDelete}
                        disabled={selectedModules.length === 0}
                    >
                        <i className="bi bi-trash3-fill"></i> Delete ({selectedModules.length})
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex gap-3 mb-3 flex-wrap">
                <div>
                    <label className="me-2">Filter by Batch:</label>
                    <select className="form-select w-auto d-inline-block"
                        value={selectedCurriculumId}
                        onChange={(e) => setSelectedCurriculumId(e.target.value)}>
                        {batches.map(b => (
                            <option
                                key={b.batch_id}
                                value={b.curriculum_id || "null"}
                                disabled={!b.curriculum_id}
                            >
                                {b.name} {b.location} {!b.curriculum_id ? "No Curriculum" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <input type="text" className="form-control"
                    style={{ maxWidth: "300px" }} placeholder="Search Module"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {loading ? <div className="text-center p-5">Loading...</div> : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Module</th>
                                <th className="text-center">Start Date</th>
                                <th className="text-center">End Date</th>
                                <th className="text-center">Action</th>
                                <th className="text-center">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={handleSelectAll}
                                        checked={filteredPeriods.length > 0 && selectedModules.length === filteredPeriods.length}
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPeriods.length > 0 ? (
                                filteredPeriods.map((period) => {
                                    const isEditing = editingId === period.quarter_id;

                                    return (
                                        <tr key={period.quarter_id} className={isEditing ? "table-primary-light" : ""}>
                                            {/* MODULE NAME */}
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-control w-75 mx-auto"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    />
                                                ) : period.name}
                                            </td>

                                            {/* START DATE */}
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        className="form-control "
                                                        value={editData.start_date}
                                                        onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                                                    />
                                                ) : period.start_date}
                                            </td>

                                            {/* END DATE */}
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={editData.end_date}
                                                        onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                                                    />
                                                ) : period.end_date}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() => handleSave(period.quarter_id)}
                                                                title="Save"
                                                            >
                                                                <i className="bi bi-check-square-fill"></i>
                                                            </button>
                                                            <button
                                                                className="icon-btn"
                                                                onClick={handleCancel}
                                                                title="Cancel"
                                                            >
                                                                <i className="bi bi-x-square-fill"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="icon-btn"
                                                                onClick={() => handleEditClick(period)}
                                                                title="Edit"
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                            {/* Note: Ensure you have a handleDelete function or add one */}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            {/* CHECKBOX */}
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedModules.includes(period.quarter_id)}
                                                    onChange={() => handleCheckboxChange(period.quarter_id)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-5 text-muted">
                                        No data available for the selected batch.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ModuleTable;