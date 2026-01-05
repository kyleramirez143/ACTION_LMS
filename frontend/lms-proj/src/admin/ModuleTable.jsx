import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function ModuleTable() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentAdminId, setCurrentAdminId] = useState(null);

    const [newlyImportedIds, setNewlyImportedIds] = useState([]);
    const ITEMS_PER_PAGE = 8;

    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentAdminId(decoded.id || decoded.userId);
            } catch (err) {
                console.error("Token decode failed:", err);
            }
        }
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const roleParam = filter === "All" ? "" : `&role=${filter}`;
        const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";

        try {
            const res = await fetch(
                `http://localhost:5000/api/users/all?page=${currentPage}&limit=${ITEMS_PER_PAGE}${roleParam}${searchParam}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP error ${res.status}: ${text}`);
            }

            const data = await res.json();
            setUsers(data.users || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            console.error("Fetch error:", err);
            alert(`Error fetching users: ${err.message}`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, filter, searchTerm]);

    const handlePrev = () => currentPage > 1 && setCurrentPage(p => p - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(p => p + 1);
    const handlePageClick = (page) => setCurrentPage(page);
    const handleEdit = (userId) => navigate(`/admin/edituser/${userId}`);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(await res.text());
            fetchUsers();
            alert("User deleted successfully!");
        } catch (err) {
            alert("Error deleting user: " + err.message);
        }
    };


    const handleCheckboxChange = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = users.filter(u => u.id !== currentAdminId).map(u => u.id);
            setSelectedUsers(allIds);
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) return;

        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch("http://localhost:5000/api/users/bulk-delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!res.ok) throw new Error(await res.text());
            alert("Users deleted successfully!");
            fetchUsers();
            setSelectedUsers([]);
        } catch (err) {
            alert("Error deleting users: " + err.message);
        }
    };

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">Batch 40 Manila - Module Period</h3>
                <div className="d-flex gap-2">
                    <Link to="/admin/set-module-date">
                        <button className="btn btn-primary rounded-pill">
                            <i class="bi bi-calendar-check-fill"></i> Set Module Period
                        </button>
                    </Link>
                </div>
            </div>

            <div className="d-flex gap-3 mb-3 flex-wrap">
                <div>
                    <label className="me-2">Filter by Role:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="form-select w-auto d-inline-block"
                    >
                        <option value="All">All</option>
                        <option value="Admin">Admin</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Trainee">Trainee</option>
                    </select>
                </div>

                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "280px" }}
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center p-5">Loading users...</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center">Module</th>
                                    <th className="text-center">Start Date</th>
                                    <th className="text-center">End Date</th>
                                    <th className="text-center">Action</th>
                                    <th className="text-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedUsers.length === users.filter(u => u.id !== currentAdminId).length && selectedUsers.length > 0}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">No users found.</td>
                                    </tr>
                                ) : (
                                    users
                                        .filter((u) => u.id !== currentAdminId)
                                        .map((user) => (
                                            <tr key={user.id} className={newlyImportedIds.includes(user.id) ? "newly-imported" : ""}>
                                                <td className="text-center">Module 1</td>
                                                <td className="text-center">10-10-1001</td>
                                                <td className="text-center">10-10-1001</td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button className="icon-btn" onClick={() => handleEdit(user.id)} title="Edit">
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>
                                                        <button className="icon-btn" onClick={() => handleDelete(user.id)} title="Delete">
                                                            <i className="bi bi-trash3-fill"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleCheckboxChange(user.id)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>

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
            )}
        </div>
    );
}

const styles = {
    page: {
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        width: "100vw",
        padding: "40px 20px",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: "10px",
        padding: "30px 40px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.20)",
    },
    title: {
        fontWeight: 600,
        marginBottom: "30px",
        fontSize: "1.5rem",
        color: "#333",
    },
    btn: {
        minWidth: "200px",
        padding: "10px 16px",
        fontWeight: 500,
        borderRadius: "6px",
    },
};


export default ModuleTable;