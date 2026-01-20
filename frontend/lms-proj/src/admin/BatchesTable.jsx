import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserRoleTable.css";

function BatchesTable() {
    const navigate = useNavigate();

    // ===================== STATE =====================
    const [batches, setBatches] = useState([]);
    const [locationFilter, setLocationFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedBatches, setSelectedBatches] = useState([]);

    const ITEMS_PER_PAGE = 7;

    // ===================== HELPERS =====================
    const getBatchCode = (name) => {
        if (!name) return "";
        const match = name.match(/\d+/);
        return match ? `B${match[0]}` : name;
    };

    const getBatchStatus = (endDate) => {
        if (!endDate) return "Pending";
        const today = new Date();
        const end = new Date(endDate);
        return today > end ? "Inactive" : "Active";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${mm}${dd}${yy}`;
    };

    // ===================== FETCH TABLE DATA =====================
    const fetchBatches = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const locationParam =
            locationFilter === "All" ? "" : `&location=${locationFilter}`;
        const searchParam = searchTerm
            ? `&search=${encodeURIComponent(searchTerm)}`
            : "";

        try {
            const res = await fetch(
                `http://localhost:5000/api/batches?page=${currentPage}&limit=${ITEMS_PER_PAGE}${locationParam}${searchParam}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
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

    // ===================== EFFECT =====================
    useEffect(() => {
        fetchBatches();
    }, [currentPage, locationFilter, searchTerm]);

    // ===================== PAGINATION =====================
    const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);
    const handleNext = () =>
        currentPage < totalPages && setCurrentPage((p) => p + 1);

    // ===================== DELETE =====================
    const handleDelete = async (batchId) => {
        if (!window.confirm("Are you sure you want to delete this batch?")) return;
        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(
                `http://localhost:5000/api/batches/delete/${batchId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) throw new Error("Failed to delete batch");

            alert("Batch deleted successfully!");
            fetchBatches();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // ===================== BULK DELETE =====================
    const handleBulkDelete = async () => {
        if (selectedBatches.length === 0) return;
        if (!window.confirm(`Delete ${selectedBatches.length} batch(es)?`)) return;

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(
                "http://localhost:5000/api/batches/bulk-delete",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ batchIds: selectedBatches }),
                }
            );

            if (!res.ok) throw new Error(await res.text());

            alert("Batches deleted successfully");
            setSelectedBatches([]);
            fetchBatches();
        } catch (err) {
            alert("Error deleting batches: " + err.message);
        }
    };

    // ===================== CHECKBOX =====================
    const handleCheckboxChange = (batchId) => {
        setSelectedBatches((prev) =>
            prev.includes(batchId)
                ? prev.filter((id) => id !== batchId)
                : [...prev, batchId]
        );
    };

    const handleSelectAll = () => {
        if (selectedBatches.length === batches.length) {
            setSelectedBatches([]);
        } else {
            setSelectedBatches(batches.map((b) => b.batch_id));
        }
    };

    // ===================== RENDER =====================
    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">All Batches</h3>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-primary rounded-pill"
                        onClick={() => navigate("/admin/add-batch")}
                    >
                        + Add New Batch
                    </button>

                    <button
                        className="btn btn-danger rounded-pill"
                        onClick={handleBulkDelete}
                        disabled={selectedBatches.length === 0}
                    >
                        Delete ({selectedBatches.length})
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="d-flex gap-3 mb-4 flex-wrap">
                <div className="d-flex align-items-center">
                    <label className="me-2 fw-bold">Location:</label>
                    <select
                        value={locationFilter}
                        onChange={(e) => {
                            setLocationFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="form-select w-auto"
                    >
                        <option value="All">All Locations</option>
                        <option value="Manila">Manila</option>
                        <option value="Cebu">Cebu</option>
                    </select>
                </div>

                <div className="flex-grow-1" style={{ maxWidth: "400px" }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center p-5">
                    <div className="spinner-border text-primary" />
                    <p className="mt-2">Loading batches...</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Batch Name</th>
                                <th>Location</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Curriculum</th>
                                <th>Status</th>
                                <th>Action</th>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        onChange={handleSelectAll}
                                        checked={
                                            selectedBatches.length === batches.length &&
                                            batches.length > 0
                                        }
                                    />
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {batches.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        No batches found.
                                    </td>
                                </tr>
                            ) : (
                                batches.map((batch) => {
                                    const status = getBatchStatus(batch.end_date);
                                    const curriculum = `${getBatchCode(
                                        batch.name
                                    )}${batch.location}${formatDate(
                                        batch.start_date
                                    )}–${formatDate(batch.end_date)}`;

                                    return (
                                        <tr key={batch.batch_id}>
                                            <td>
                                                <Link
                                                    to="/admin/checkpointview"
                                                    state={{ batchId: batch.batch_id, batchName: batch.name }}
                                                    className="batch-link"
                                                    title="View checkpoint for this batch"
                                                >
                                                    {batch.name}
                                                </Link>
                                            </td>

                                            <td>{batch.location}</td>
                                            <td>{batch.start_date}</td>
                                            <td>{batch.end_date}</td>
                                            <td>{curriculum}</td>
                                            <td >
                                                <span
                                                    className={`badge ${status === "Active" ? "bg-success-subtle text-success" : "bg-success-subtle text-danger"
                                                        }`}
                                                >
                                                    {status}
                                                </span>
                                            </td>
                                            <td >
                                                <div className="d-flex justify-content-start gap-2">
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
                                            <td >
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
            )}
        </div>
    );
}

export default BatchesTable;
