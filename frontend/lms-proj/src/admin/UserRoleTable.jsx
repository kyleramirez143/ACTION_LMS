import React, { useEffect, useState } from "react";
import "./UserRoleTable.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import logo from "../image/user.svg";

function UserRoleTable() {
    const navigate = useNavigate();
    const { t } = useTranslation();
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
            alert(t("user_management.error_fetch_users", { message: err.message }));
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
            alert(t("user_management.user_deleted_successfully"));
        } catch (err) {
            alert(t("user_management.error_deleting_user", { error: err.message }));
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
            alert(t("user_management.error_generic", { message: err.message }));
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
                    errors.map(e => `${e.email}: ${e.error}`).join("\n")
                );
            }

            if (added.length > 0 && errors.length > 0) {
                alert(
                    t("user_management.import_warning", {
                        imported: added.length,
                        failedList: errors.map(e => `• ${e.email}: ${e.error}`).join("\n")
                    })
                );
            }
            else {
                alert(t("user_management.import_success", { count: added.length }));
            }

            setNewlyImportedIds(added.map(u => u.id));
            fetchUsers();
        } catch (err) {
            alert(t("user_management.error_import_csv", { error: err.message }));
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
            alert(t("user_management.error_download_template", { message: err.message }));
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
            alert(t("user_management.users_deleted_successfully"));
            fetchUsers();
            setSelectedUsers([]);
        } catch (err) {
            alert(t("user_management.error_delete_users", { message: err.message }));
        }
    };

    const noUsersAtAll = users.length === 0 && filter === "All" && searchTerm === "";
    const filterEmpty = users.length === 0 && !noUsersAtAll;

    return (
        <div className="container py-4" style={{ maxWidth: "1400px" }}>
            <div className="user-role-card" style={{ margin: 0 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="section-title">{t("user_management.title")}</h3>
                    <div className="d-flex gap-2">
                        {(noUsersAtAll || users.length > 0) && (
                            <Link to="/admin/adduser">
                                <button className="btn btn-primary rounded-pill">
                                    <i className="bi bi-person-plus-fill"></i> {t("user_management.add_new_user")}
                                </button>
                            </Link>
                        )}

                        {/* Import Users (only hide when filter-empty and not Trainee) */}
                        {(users.length > 0 || (noUsersAtAll && filter === "Trainee")) && (
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
                        )}

                        {/* Bulk Delete only when users exist */}
                        {users.length > 0 && (
                            <button className="btn btn-danger rounded-pill" onClick={handleBulkDelete}>
                                <i className="bi bi-trash3-fill"></i> Delete ({selectedUsers.length})
                            </button>
                        )}
                    </div>
                </div>

                {!noUsersAtAll && !filterEmpty && (
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
                            disabled={filterEmpty}
                        />
                    </div>
                )}

                {/* Empty State - No Users At All */}
                {noUsersAtAll && (
                    <div className="d-flex flex-column align-items-center justify-content-center py-5">
                        <img
                            src={logo}
                            alt="No modules"
                            style={{ maxWidth: "220px" }}
                            className="mb-3"
                        />
                        <h3 className="section-title">No Users Yet</h3>
                        <p className="text-muted">Start by adding or importing users.</p>
                        <div className="d-flex justify-content-center gap-2 mt-3">
                            <Link to="/admin/adduser">
                                <button className="btn btn-primary rounded-pill">
                                    Add User
                                </button>
                            </Link>
                            <Link to="#">
                                <button className="btn btn-success rounded-pill" onClick={downloadTemplate}>
                                    Import Users
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center p-5">Loading users...</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table">
                                <thead className="table-light">
                                    <tr>
                                        <td className="text-center">{t("user_management.name")}</td>
                                        <td className="text-center">{t("user_management.email")}</td>
                                        <td className="text-center">{t("user_management.level")}</td>
                                        <td className="text-center">{t("user_management.batch")}</td>
                                        <td className="text-center">{t("user_management.location")}</td>
                                        <td className="text-center">{t("user_management.status")}</td>
                                        <td className="text-center">{t("user_management.actions")}</td>
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
                                            <td colSpan="8" className="text-center py-5">
                                                <img src="/assets/empty-state.svg" style={{ maxWidth: 120 }} alt="" />
                                                <h5 className="mt-2">{filterEmpty ? "No Users Found" : "No Users Yet"}</h5>
                                                <p className="text-muted">{filterEmpty ? "No users match this role." : "Start by adding or importing users."}</p>
                                                <div className="d-flex justify-content-center gap-2 mt-2">
                                                    <Link to="/admin/adduser">
                                                        <button className="btn btn-primary btn-sm">Add User</button>
                                                    </Link>
                                                    {(filter === "Trainee" || !filterEmpty) && (
                                                        <button className="btn btn-success btn-sm" onClick={downloadTemplate}>Import Users</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.filter(u => u.id !== currentAdminId).map((user) => (
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

                        {/* Pagination */}
                        {users.length > 0 && (
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default UserRoleTable;