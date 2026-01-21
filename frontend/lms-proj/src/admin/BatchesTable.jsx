import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserRoleTable.css";

function BatchesTable() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [batches, setBatches] = useState([]);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const ITEMS_PER_PAGE = 7;

    // ✅ ADD IT HERE (helper functions section)
    const getBatchCode = (name) => {
        if (!name) return "";
        const match = name.match(/\d+/);
        return match ? `B${match[0]}` : name;
    };

    // Helper to determine status on the fly
    const getBatchStatus = (endDate) => {
        if (!endDate) return "Pending";
        const today = new Date();
        const end = new Date(endDate);
        return today > end ? "Inactive" : "Active";
    };

    // Helper to format date as MMDDYY
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${mm}${dd}${yy}`;
    };

    const fetchBatches = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const locationParam = filter === "All" ? "" : `&location=${filter}`;
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";

        try {
            const res = await fetch(
                `http://localhost:5000/api/batches?page=${currentPage}&limit=${ITEMS_PER_PAGE}${locationParam}${searchParam}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) throw new Error(`HTTP error ${res.status}`);

            const data = await res.json();
            setBatches(data.batches || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || 1);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [currentPage, filter, searchTerm]);

    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
    const handlePageClick = (page) => setCurrentPage(page);

    const handleDelete = async (batchId) => {
        if (!window.confirm(t("batches.confirm_delete_single"))) return;

        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`http://localhost:5000/api/batches/delete/${batchId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Errort("batches.delete_failed")

            alertt("batches.deleted_success")
            fetchBatches();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedBatches.length === 0) return;

        if (!window.confirm(`Delete ${selectedBatches.length} batch(es)?`)) return;

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch("http://localhost:5000/api/batches/bulk-delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ batchIds: selectedBatches }),
            });

            if (!res.ok) throw new Error(await res.text());

            alert(t("batches.bulk_deleted"));
            setSelectedBatches([]);
            fetchBatches();
        } catch (err) {
            alert(t("batches.bulk_delete_failed") + err.message);
        }
    };

    const handleCheckboxChange = (batchId) => {
        setSelectedBatches((prev) =>
            prev.includes(batchId)
                ? prev.filter(id => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handleSelectAll = () => {
        if (selectedBatches.length === batches.length) {
            setSelectedBatches([]);
        } else {
            setSelectedBatches(batches.map(b => b.batch_id));
        }
    };

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">{t("batches.all_batches")}</h3>
                <div className="d-flex gap-2">
                    <Link to="/admin/add-batch">
                        <button className="btn btn-primary rounded-pill">
                            <i className="bi bi-plus-circle-fill me-2"></i>{t("batches.add_new_batch")}
                        </button>
                    </Link>

                    <button
                        className="btn btn-danger rounded-pill"
                        onClick={handleBulkDelete}
                        disabled={selectedBatches.length === 0}
                    >
                        <i className="bi bi-trash3-fill"></i> {t("batches.delete")} ({selectedBatches.length})
                    </button>
                </div>
            </div>

            <div className="d-flex gap-3 mb-4 flex-wrap">
                <div className="d-flex align-items-center">
                    <label className="me-2 fw-bold">{t("batches.filter_by_location")}</label>
                    <select
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="form-select w-auto"
                    >
                        <option value="All">{t("batches.all_locations")}</option>
                        <option value="Manila">{t("batches.manila")}</option>
                        <option value="Cebu">{t("batches.cebu")}</option>
                    </select>
                </div>

                <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder={t("batches.search")}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {
                loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2">{t("batches.loading")}</p>
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center">{t("batches.batch_name")}</th>
                                        <th className="text-center">{t("batches.location")}</th>
                                        <th className="text-center">{t("batches.start_date")}</th>
                                        <th className="text-center">{t("batches.end_date")}</th>
                                        <th className="text-center">{t("batches.curriculum")}</th>
                                        <th className="text-center">{t("batches.status")}</th>
                                        <th className="text-center">{t("batches.action")}</th>
                                        <th className="text-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                onChange={handleSelectAll}
                                                checked={selectedBatches.length === batches.length && batches.length > 0}
                                            />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batches.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted">
                                                {t("batches.no_match")}
                                            </td>
                                        </tr>
                                    ) : (
                                        batches.map((batch) => {
                                            const status = getBatchStatus(batch.end_date);
                                            const curriculum = `${getBatchCode(batch.name)}${batch.location}${formatDate(batch.start_date)}–${formatDate(batch.end_date)}`;

                                            return (
                                                <tr key={batch.batch_id}>
                                                    <td className="text-center">
                                                        <Link
                                                            to="/admin/checkpointview"
                                                            state={{ batchId: batch.batch_id, batchName: batch.name }}
                                                            className="batch-link"
                                                            title="View checkpoint for this batch"
                                                        >
                                                            {batch.name}
                                                        </Link>
                                                    </td>
                                                    <td className="text-center">
                                                        {batch.location}
                                                    </td>
                                                    <td className="text-center">
                                                        {batch.start_date}
                                                    </td>
                                                    <td className="text-center">
                                                        {batch.end_date}
                                                    </td>
                                                    <td className="text-center small fw-bold">{curriculum}</td>
                                                    <td className="text-center">
                                                        <span
                                                            className={`badge ${status === "Active" ? "bg-success-subtle text-success" : "bg-success-subtle text-danger"
                                                                }`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <button className="icon-btn" onClick={() =>
                                                                navigate(`/admin/edit-batch/${batch.batch_id}`)
                                                            } title="Edit">
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                            <button className="icon-btn" onClick={() => handleDelete(batch.batch_id)} title="Delete">
                                                                <i className="bi bi-trash3-fill"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            checked={selectedBatches.includes(batch.batch_id)}
                                                            onChange={() => handleCheckboxChange(batch.batch_id)}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="pagination-wrapper">
                            <ul className="pagination custom-pagination">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={handlePrev}>‹</button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                        <button className="page-link" onClick={() => handlePageClick(i + 1)}>{i + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button className="page-link" onClick={handleNext}>›</button>
                                </li>
                            </ul>
                        </div>
                    </>
                )
            }
        </div >
    );
}

export default BatchesTable;