import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    userRoles: [],
    login: () => {}, 
    logout: () => {},
    setIsAuthenticated: () => {} 
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
        setUserRoles([]);
    }, []);

    const handleLogin = useCallback((token) => {
        localStorage.setItem('authToken', token);
        const decoded = jwtDecode(token);
        setIsAuthenticated(true);
        setUser({ id: decoded.id, email: decoded.email });
        setUserRoles(decoded.roles || []);
    }, []);
    
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                
                if (decoded.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                    setUser({ id: decoded.id, email: decoded.email });
                    setUserRoles(decoded.roles || []);
                } else {
                    handleLogout(); 
                }
            } catch (error) {
                console.error("Invalid token found in storage:", error);
                handleLogout(); 
            }
        }
        setLoading(false); 
    }, [handleLogout]);

    const contextValue = {
        isAuthenticated,
        user,
        userRoles,
        login: handleLogin, 
        logout: handleLogout,
        setIsAuthenticated,
    };
    
    if (loading) {
        return <div>Loading authentication state...</div>; 
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
