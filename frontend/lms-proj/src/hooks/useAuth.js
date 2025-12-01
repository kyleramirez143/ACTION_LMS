// ./hooks/useAuth.js

import { useCallback, useContext } from 'react';
// IMPORTANT: Adjust the path to where you saved AuthContext.js
import { AuthContext } from '../context/AuthContext.jsx'; 

// The 'useAuth' hook is simply a wrapper around useContext
export const useAuth = () => {
    const context = useContext(AuthContext); // This retrieves the contextValue from the Provider
    if (!context) throw new Error('useAuth must be used within AuthProvider');

    const { userRoles, isAuthenticated, login, logout } = context;

    // The hasRole function you previously defined, now using roles from the context
    const hasRole = useCallback((requiredRoles) => {
        if (!userRoles || userRoles.length === 0) return false;
        return requiredRoles.some(role => userRoles.includes(role));
    }, [userRoles]);

    return { 
        ...context, // Expose all context values (user, isAuthenticated, login, logout)
        hasRole 
    };
};