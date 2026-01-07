import React, { useEffect, useState } from "react";
import "./UserRoleTable.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function UserRoleTable() {
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

    const handleToggleStatus = async (userId) => {
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(`http://localhost:5000/api/users/toggle-status/${userId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Toggle failed");
            fetchUsers();
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // FIXED: CSV Upload handler
    const handleCSVUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("http://localhost:5000/api/users/import", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to import users");

            const added = data.addedUsers || [];
            const errors = data.errors || [];

            if (added.length === 0 && errors.length > 0) {
                throw new Error(
                    "Users already exists."
                );
            }

            if (added.length > 0 && errors.length > 0) {
                alert(
                    `Import completed with warnings.\n\n` +
                    `Imported: ${added.length}\n` +
                    `Failed:\n` +
                    errors.map(e => `• ${e.email}: ${e.error}`).join("\n")
                );
            }
            else {
                alert(`Successfully imported ${added.length} users!`);
            }

            setNewlyImportedIds(added.map(u => u.id));
            fetchUsers();
        } catch (err) {
            alert("Error importing CSV: " + err.message);
        }
        e.target.value = null;
    };

    // FIXED: Download Template handler
    const downloadTemplate = async () => {
        try {
            const token = localStorage.getItem("authToken");

            const res = await fetch("http://localhost:5000/api/users/download-template", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });

            // Check if the response is actually a CSV
            if (!res.ok) {
                // Try to get error message from server response
                const errorText = await res.text();
                throw new Error(`Server responded with ${res.status}: ${errorText}`);
            }

            const blob = await res.blob();

            // Basic check: is the blob empty?
            if (blob.size === 0) {
                throw new Error("The generated template is empty.");
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "user_import_template.csv";
            document.body.appendChild(a);
            a.click();

            // Cleanup
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Full Error Details:", err);
            alert("Error downloading template: " + err.message);
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
                <h3 className="section-title">User Role Management</h3>
                <div className="d-flex gap-2">
                    <Link to="/admin/adduser">
                        <button className="btn btn-primary rounded-pill">
                            <i className="bi bi-person-plus-fill"></i> Add New User
                        </button>
                    </Link>

                    <div className="dropdown">
                        <button
                            className="btn btn-success rounded-pill"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="bi bi-person-plus-fill"></i> Import Users
                        </button>

                        <ul className="dropdown-menu">
                            <li>
                                <label className="dropdown-item" onClick={downloadTemplate}>
                                    Click to Download Template
                                </label>
                            </li>
                            <li>
                                {/* FIXED: Using label to trigger hidden input for better UI compatibility */}
                                <label className="dropdown-item" style={{ cursor: "pointer", marginBottom: 0 }}>
                                    Import Users
                                    <input
                                        type="file"
                                        accept=".csv"
                                        style={{ display: "none" }}
                                        onChange={handleCSVUpload}
                                    />
                                </label>
                            </li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-danger rounded-pill"
                        onClick={handleBulkDelete}
                        disabled={selectedUsers.length === 0}
                    >
                        <i className="bi bi-trash3-fill"></i> Delete ({selectedUsers.length})
                    </button>
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
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Trainee">Trainee</option>
                    </select>
                </div>

                <input
                    type="text"
                    className="form-control"
                    style={{ maxWidth: "400px" }}
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
                                    <th className="text-center">Name</th>
                                    <th className="text-center">Email</th>
                                    <th className="text-center">User Level</th>
                                    <th className="text-center">Batch</th>
                                    <th className="text-center">Location</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Actions</th>
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
                                                <td className="text-center">{user.name}</td>
                                                <td className="text-center text-muted">{user.email}</td>
                                                <td className="text-center">{user.level}</td>
                                                <td className="text-center">
                                                    {user.level === "Trainee" ? user.batch : "Not Applicable"}
                                                </td>
                                                <td className="text-center">
                                                    {user.location || "-"}
                                                </td>
                                                <td className="text-center">
                                                    <span
                                                        className={`badge rounded-pill ${user.status === "Active" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                                                        style={{ cursor: "pointer", padding: "0.5em 1em" }}
                                                        onClick={() => handleToggleStatus(user.id)}
                                                    >
                                                        {user.status}
                                                    </span>
                                                </td>
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

export default UserRoleTable;
