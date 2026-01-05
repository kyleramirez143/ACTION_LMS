// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import {jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Logout function: clears auth but keeps userProfile for UI
    const logout = useCallback(() => {
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUserRoles([]);
        // ✅ Keep userProfile for Navbar display
    }, []);

    const fetchProfile = useCallback(async (token) => {
        try {
            const res = await fetch("http://localhost:5000/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();
            setUserProfile(data); // store profile for Navbar
            setUserRoles([data.role]);
            setIsAuthenticated(true);
        } catch (err) {
            console.error(err);
            logout();
        }
    }, [logout]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const decoded = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                logout();
            } else {
                fetchProfile(token);
            }
        } catch (err) {
            console.error("Invalid token:", err);
            logout();
        } finally {
            setLoading(false);
        }
    }, [fetchProfile, logout]);

    const login = async (token) => {
        localStorage.setItem("authToken", token);
        await fetchProfile(token);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                userProfile,
                setUserProfile,
                userRoles,
                setUserRoles,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
