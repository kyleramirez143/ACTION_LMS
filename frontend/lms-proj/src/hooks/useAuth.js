// ./hooks/useAuth.js

import { useContext } from 'react';
// IMPORTANT: Adjust the path to where you saved AuthContext.js
import { AuthContext } from '../context/AuthContext.jsx'; 

// The 'useAuth' hook is simply a wrapper around useContext
export const useAuth = () => {
    const context = useContext(AuthContext); // This retrieves the contextValue from the Provider

    if (!context) {
        // This is a crucial check that should never fail if AuthProvider is wrapping App
        // But helpful for debugging if someone uses the hook outside the provider.
        throw new Error('useAuth must be used within an AuthProvider');
    }

    const { userRoles, isAuthenticated, login, logout } = context;

    // The hasRole function you previously defined, now using roles from the context
    const hasRole = (requiredRoles) => {
        if (!userRoles || userRoles.length === 0) return false;
        
        // Check if the user's roles array includes any of the required roles
        return requiredRoles.some(role => userRoles.includes(role));
    };

    return { 
        ...context, // Expose all context values (user, isAuthenticated, login, logout)
        hasRole 
    };
};