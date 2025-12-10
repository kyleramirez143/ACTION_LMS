import React, { useState, useEffect } from "react";
// 1. Import useParams to get the ID from the URL
import { useNavigate, useParams } from "react-router-dom"; 
import { jwtDecode } from "jwt-decode";

function AddUser() { // Keeping the original function name
    const navigate = useNavigate();
    // 2. Get the user ID from the URL (if available)
    const { id: userId } = useParams(); 
    const isEditMode = !!userId; // Flag: true if userId exists
    
    const token = localStorage.getItem("authToken");

    // --- State Management ---
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        role: "Trainee", 
        is_active: true, // New field needed for Edit mode
    });
    const [isLoadingData, setIsLoadingData] = useState(isEditMode); 

    // --- 3. AUTH CHECK ---
    useEffect(() => {
        if (!token) return navigate("/");

        try {
            const decoded = jwtDecode(token);
            const roles = decoded.roles || [];
            if (!roles.includes("Admin")) navigate("/access-denied");
        } catch (err) {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }, [token, navigate]);

    // --- 4. FETCH USER DATA (EDIT MODE ONLY) ---
    useEffect(() => {
        if (isEditMode) {
            const fetchUserData = async () => {
                try {
                    // This relies on the new GET /api/users/:id endpoint we discussed
                    const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!res.ok) throw new Error("Failed to fetch user data for editing.");
                    
                    const data = await res.json();
                    
                    // Populate formData with existing user details
                    setFormData({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        role: data.role || "Trainee", 
                        is_active: data.is_active,
                    });
                } catch (err) {
                    console.error("Edit fetch error:", err);
                    alert("Error loading user data: " + err.message);
                    navigate("/admin/userroles"); // Go back on failure
                } finally {
                    setIsLoadingData(false);
                }
            };
            fetchUserData();
        } else {
            // If in Add mode, ensure loading is false immediately
            setIsLoadingData(false);
        }
    }, [isEditMode, userId, token, navigate]);

    // --- 5. HANDLERS ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // New handler for the Status switch
    const handleStatusChange = (e) => {
         setFormData(prev => ({
            ...prev,
            is_active: e.target.checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine method and URL based on mode
        const method = isEditMode ? "PUT" : "POST";
        const url = isEditMode 
            ? `http://localhost:5000/api/users/update/${userId}` // PUT endpoint
            : "http://localhost:5000/api/users/add"; // POST endpoint
            
        // The PUT endpoint (updateUser controller) expects 'roles' as an array
        const payload = isEditMode 
            ? { ...formData, roles: [formData.role] }
            : formData;
        
        // Prevent Admin self-editing
        try {
            if (isEditMode && String(jwtDecode(token).id) === String(userId)) {
                alert("Self-editing of roles/status is restricted via this administrative form.");
                return;
            }
        } catch (error) {
            console.error("Token decoding error:", error);
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const text = await response.text(); 
            // Handle error response
            if (!response.ok) {
                let errorMessage = text;
                try {
                    errorMessage = JSON.parse(text).message || JSON.parse(text).error || text;
                } catch (e) { /* ignore */ }
                throw new Error(errorMessage);
            }

            alert(`User ${isEditMode ? "updated" : "added"} successfully!`);
            navigate("/admin/userroles");

        } catch (err) {
            console.error("Fetch error:", err);
            alert(`Operation failed: ${err.message}`);
        }
    };
    
    // Dynamic text for title and button
    const formTitle = isEditMode ? "Edit User" : "Add New User";
    const submitButtonText = isEditMode ? "Save Changes" : "Add User";
    
    if (isEditMode && isLoadingData) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h3 style={styles.title}>Loading User Data...</h3>
                </div>
            </div>
        );
    }

    // --- RENDER ---
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h3 style={styles.title}>{formTitle}</h3>

                <form onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">First Name</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                name="first_name"
                                placeholder="Enter First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">Last Name</label>
                        <div className="col-sm-8">
                            <input
                                type="text"
                                className="form-control"
                                name="last_name"
                                placeholder="Enter Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">Email</label>
                        <div className="col-sm-8">
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                // Disable email editing in Edit mode
                                // disabled={isEditMode} 
                            />
                        </div>
                    </div>

                    {/* User Level (Role) */}
                    <div className="mb-3 row">
                        <label className="col-sm-2 col-form-label">User Level</label>
                        <div className="col-sm-8">
                            <select
                                className="form-control"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="Admin">Admin</option>
                                <option value="Trainer">Trainer</option>
                                <option value="Trainee">Trainee</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Status Toggle (Only render in Edit Mode) */}
                    {isEditMode && (
                        <div className="mb-3 row">
                            <label className="col-sm-2 col-form-label">Status</label>
                            <div className="col-sm-8 d-flex align-items-center">
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id="is_active_switch"
                                        checked={formData.is_active}
                                        onChange={handleStatusChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_active_switch">
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Action Buttons */}
                    <div className="mt-4">
                        <button type="submit" className="btn btn-primary rounded-pill me-2" style={styles.btn}>
                            {submitButtonText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-primary rounded-pill"
                            style={styles.btn}
                            onClick={() => navigate("/admin/userroles")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

const styles = {
    // ... (Your existing styles)
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

export default AddUser;