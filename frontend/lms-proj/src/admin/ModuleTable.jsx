import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "./UserRoleTable.css";
import logo from "../image/courses.svg";

function ModuleTable() {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const { t } = useTranslation();
    // --- State Management ---
    const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
    const [periods, setPeriods] = useState([]);
    const [batches, setBatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: "", start_date: "", end_date: "" });
    const [selectedModules, setSelectedModules] = useState([]);

    // --- Fetch periods ---
    const fetchPeriods = useCallback(async () => {
        if (!selectedCurriculumId || selectedCurriculumId === "null") {
            setPeriods([]);
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/quarters/batch/${selectedCurriculumId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const data = await res.json();
            setPeriods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch periods error:", err);
            setPeriods([]);
        }
    }, [selectedCurriculumId, token]);

    // --- Fetch batches ---
    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/batches/dropdown", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setBatches(data);
                    if (!selectedCurriculumId) {
                        const firstValid = data.find((b) => b.curriculum_id !== null);
                        if (firstValid) setSelectedCurriculumId(String(firstValid.curriculum_id));
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
    const filteredPeriods = periods.filter((p) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(searchLower) ||
            p.start_date.toLowerCase().includes(searchLower) ||
            p.end_date.toLowerCase().includes(searchLower)
        );
    });

    const handleCheckboxChange = (id) => {
        setSelectedModules((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = filteredPeriods.map((p) => p.quarter_id);
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
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditClick = (period) => {
        setEditingId(period.quarter_id);
        setEditData({
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
        });
    };

    const handleCancel = () => setEditingId(null);

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
                fetchPeriods();
            } else {
                alert(t("module_management.update_failed"));
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const currentBatch = batches.find((b) => String(b.curriculum_id) === String(selectedCurriculumId));
    const hasPeriods = periods.length > 0;
    const noBatchesExist = batches.length === 0;

    const dynamicTitle = currentBatch
        ? `${currentBatch.name} ${currentBatch.location} - ${t("quarters.quarter")}`
        : t("quarters.title_default");

    // --- Render ---
    if (noBatchesExist) {
        // State 1: No batches at all
        return (
            <div className="user-role-card text-center py-5 text-muted">
                <img src={logo} alt="Logo" className="img-fluid mb-3" style={{ maxWidth: "200px" }} />
                <h3 className="mb-2">{t("quarters.no_batches_yet")}</h3>
                <p className="mb-3">{t("quarters.start_create")}</p>
                <button className="btn btn-primary" onClick={() => navigate("/admin/set-module-date")}>
                    <i className="bi bi-plus-circle-fill"></i> {t("quarters.set_quarter")}
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            <div className="user-role-card" style={{ margin: 0, minHeight: "550px"}}>
                {/* Header and Top-right buttons */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title">{dynamicTitle}</h3>
                    <div className="d-flex gap-2">
                        <Link to="/admin/set-module-date">
                            <button className="btn btn-primary rounded-pill">
                                <i className="bi bi-calendar2-plus-fill"></i> {t("quarters.set_quarter")}
                            </button>
                        </Link>
                        {hasPeriods && (
                            <button
                                className="btn btn-danger rounded-pill"
                                onClick={handleBulkDelete}
                                disabled={selectedModules.length === 0}
                            >
                                <i className="bi bi-trash3-fill"></i> {t("module_management.delete_modules", { count: selectedModules.length })}
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="d-flex gap-3 mb-3 flex-wrap">
                    <div>
                        <label className="me-2">{t("module_management.filter_by_batch")}</label>
                        <select className="form-select w-auto d-inline-block"
                            value={selectedCurriculumId}
                            onChange={(e) => setSelectedCurriculumId(e.target.value)}>
                            {batches.map(b => (
                                <option
                                    key={b.batch_id}
                                    value={b.curriculum_id || "null"}
                                    disabled={!b.curriculum_id}
                                >
                                    {b.name} {b.location} {!b.curriculum_id ? t("module_management.no_curriculum") : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        className="form-control"
                        style={{ maxWidth: "300px" }}
                        placeholder="Search Module"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">{t("module_management.table_module")}</th>
                                <th className="text-center">{t("module_management.table_start_date")}</th>
                                <th className="text-center">{t("module_management.table_end_date")}</th>
                                <th className="text-center">{t("module_management.table_action")}</th>
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
                            {hasPeriods ? (
                                filteredPeriods.map((period) => {
                                    const isEditing = editingId === period.quarter_id;
                                    return (
                                        <tr key={period.quarter_id} className={isEditing ? "table-primary-light" : ""}>
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-control w-75 mx-auto"
                                                        value={editData.name}
                                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                    />
                                                ) : (
                                                    period.name
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={editData.start_date}
                                                        onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                                                    />
                                                ) : (
                                                    period.start_date
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={editData.end_date}
                                                        onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                                                    />
                                                ) : (
                                                    period.end_date
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex justify-content-center gap-2">
                                                    {isEditing ? (
                                                        <>
                                                            <button className="icon-btn" onClick={() => handleSave(period.quarter_id)} title={t("module_management.save")}>
                                                                <i className="bi bi-check-square-fill"></i>
                                                            </button>
                                                            <button className="icon-btn" onClick={handleCancel} title={t("module_management.cancel")}>
                                                                <i className="bi bi-x-square-fill"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button className="icon-btn" onClick={() => handleEditClick(period)} title={t("module_management.edit")}>
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
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
                                    <td colSpan="5" className="text-center text-muted py-5">
                                        <>
                                            <img src={logo} alt="Logo" className="img-fluid mb-3"
                                                style={{ maxWidth: "200px" }} />
                                            <h3 className="mb-2">{t("quarters.no_periods")}</h3>
                                            <p className="mb-0">{t("quarters.no_assigned")}</p>
                                        </>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ModuleTable;