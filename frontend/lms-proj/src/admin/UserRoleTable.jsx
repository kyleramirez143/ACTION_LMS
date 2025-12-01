import React from "react";
import "./UserRoleTable.css";
import { Link } from "react-router-dom";

function UserRoleTable() {
    const users = [
        {
            name: "Alice Tan",
            email: "alice.tan@awsys-i.com",
            level: "Trainer",
            permission: "View Courses, Take Quizzes",
            status: "Active",
        },
        {
            name: "Benjamin Lee",
            email: "benjamin.lee@awsys-i.com",
            level: "Trainer",
            permission: "Create Courses, Quiz / Test / Mock Exams and Access the Performance of the Trainee",
            status: "Active",
        },
        {
            name: "Emma Lim",
            email: "emma.lim@awsys-i.com",
            level: "Trainer",
            permission: "View Courses, Take Quizzes",
            status: "Active",
        },
        {
            name: "Farhan Ibrahim",
            email: "farhan.ibrahim@awsys-i.com",
            level: "Trainer",
            permission: "View Courses, Take Quizzes",
            status: "Deactivate",
        },
        {
            name: "Grace Wong",
            email: "grace.wong@awsys-i.com",
            level: "Trainer",
            permission: "View Courses, Take Quizzes",
            status: "Active",
        },
    ];

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

            <div className="table-responsive">
                <table class="table">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">Name</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">User Level</th>
                            <th className="text-center">Permission</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td className="text-center">{user.name}</td>
                                <td className="text-center">{user.email}</td>
                                <td className="text-center">{user.level}</td>
                                <td className="text-center">{user.permission}</td>
                                <td className="text-center">
                                    <span className={`badge ${user.status === "Active" ? "bg-success" : "bg-danger"}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-2">
                                        <button type="button" className="icon-btn">
                                            <i className="bi bi-pencil-fill"></i>
                                        </button>
                                        <div className="div"></div>
                                        <button type="button" className="icon-btn">
                                            <i className="bi bi-trash3-fill"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination-wrapper">
                <nav>
                    <ul className="pagination custom-pagination">
                        <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}> <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z" /></svg> </button></li>
                        <li className="page-item"><button className="page-link">1</button></li>
                        <li className="page-item"><button className="page-link">2</button></li>
                        <li className="page-item active"><button className="page-link">3</button></li>
                        <li className="page-item"><button className="page-link">4</button></li>
                        <li className="page-item"><button className="page-link">5</button></li>
                        <li className="page-item"><button className="page-link" style={{ backgroundColor: "#f0f0f0" }}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" /></svg></button></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default UserRoleTable;
