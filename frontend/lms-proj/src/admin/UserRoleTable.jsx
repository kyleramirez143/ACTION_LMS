import React, { useEffect, useState } from "react";
import "./UserRoleTable.css";
// 1. IMPORT useNavigate
import { Link, useNavigate } from "react-router-dom"; 
import { jwtDecode } from "jwt-decode"; 

function UserRoleTable() {
    const navigate = useNavigate(); // Initialize navigate hook
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentAdminId, setCurrentAdminId] = useState(null); 

    // Helper to get the logged-in user's ID from the JWT
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentAdminId(decoded.id || decoded.userId); 
            } catch (error) {
                console.error("Failed to decode token:", error);
                // Consider logging out the user if the token is invalid
            }
        }
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("authToken"); // Get the token
        
        try {
            // 2. INCLUDE AUTHORIZATION HEADER for authenticated endpoint
            const res = await fetch(`http://localhost:5000/api/users/all?page=${currentPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            if (!res.ok) {
                // If unauthorized (401/403), this handles it
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Authorization failed. Please log in again.");
                }
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (Array.isArray(data)) {
                setUsers(data);
                setTotalPages(1); 
            } else if (data.users && Array.isArray(data.users)) {
                setUsers(data.users);
                setCurrentPage(data.currentPage);
                setTotalPages(data.totalPages);
            } else {
                setUsers([]);
                setTotalPages(1);
            }
            
        } catch (err) {
            console.error("Fetch error:", err);
            // Alert user of the fetch error (e.g., connection refused or authorization)
            alert(`Error fetching users: ${err.message}. Check server status and login.`);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    // 3. NEW Handler for the Edit Button
    const handleEdit = (userId) => {
        // Navigate to the dual-purpose AddUser form with the user ID
        navigate(`/admin/edituser/${userId}`);
    };
    
    // Handler must also include the token for delete/toggle-status
    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const text = await res.text();
            if (!res.ok) throw new Error(text);

            setUsers(users.filter(u => u.id !== userId));
            alert("User deleted successfully!");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting user: " + err.message);
        }
    };

    const handleToggleStatus = async (userId) => {
        const token = localStorage.getItem("authToken");

        try {
            const res = await fetch(`http://localhost:5000/api/users/toggle-status/${userId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Error toggling status");

            // Assuming the backend returns the updated status or the whole object
            setUsers(users.map(u => u.id === userId ? { ...u, status: data.status, is_active: data.is_active } : u));
            alert(data.message);
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    };

    let filteredUsers = (users || []).filter(user => user.id !== currentAdminId);
    filteredUsers = filteredUsers.filter(user => filter === "All" || user.level === filter);

    return (
        <div className="user-role-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="section-title">User Role Management</h3>
                <Link to="/admin/adduser">
                    <button className="btn btn-primary rounded-pill">
                        <i className="bi bi-person-plus-fill"></i> Add New User
                    </button>
                </Link>
            </div>

            {/* Filter by Role */}
            <div className="mb-3">
                <label className="me-2">Filter by Role:</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-select w-auto d-inline-block">
                    <option value="All">All</option>
                    <option value="Admin">Admin</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Trainee">Trainee</option>
                </select>
            </div>

            {loading ? (
                <div className="text-center p-5">Loading users...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">Name</th>
                                <th className="text-center">Email</th>
                                <th className="text-center">User Level</th>
                                <th className="text-center">Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No users found.</td>
                                </tr>
                            ) : filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="text-center">{user.name}</td>
                                    <td className="text-center">{user.email}</td>
                                    <td className="text-center">{user.level}</td> 
                                    <td className="text-center">
                                        <span
                                            className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleToggleStatus(user.id)}
                                            title="Click to toggle status"
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            
                                            {/* 4. Edit Button connected to handleEdit */}
                                            <button 
                                                type="button" 
                                                className="icon-btn" 
                                                title="Edit"
                                                onClick={() => handleEdit(user.id)} // 👈 Calls the redirect function
                                            >
                                                <i className="bi bi-pencil-fill"></i>
                                            </button>
                                            
                                            {/* Delete Button (Only for other users) */}
                                            {user.id !== currentAdminId && (
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Delete"
                                                >
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination (No changes) */}
                    <div className="pagination-wrapper">
                        <nav>
                            <ul className="pagination custom-pagination">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        style={{ backgroundColor: "#f0f0f0" }}
                                        onClick={handlePrev}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg>
                                    </button>
                                </li>

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <li
                                        key={i + 1}
                                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                                    >
                                        <button className="page-link" onClick={() => handlePageClick(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}

                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        style={{ backgroundColor: "#f0f0f0" }}
                                        onClick={handleNext}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRoleTable;