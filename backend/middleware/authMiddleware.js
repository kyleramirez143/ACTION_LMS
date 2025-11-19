// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
// IMPORTANT: Ensure this JWT_SECRET variable is available (e.g., loaded via dotenv in server.js)
const JWT_SECRET = process.env.JWT_SECRET || 'a_secure_default_secret_for_dev'; 

/**
 * Middleware to verify JWT and attach user payload to req.user.
 * Protects routes requiring any logged-in user access.
 */
export const protect = (req, res, next) => {
    let token;

    // Check for token in the 'Authorization' header (Format: 'Bearer <TOKEN>')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (split 'Bearer' from the actual token string)
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the secret
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach the decoded payload (id, email, roles) to the request object
            // This makes user data available in subsequent controllers
            req.user = decoded; 

            // Proceed to the next middleware or route handler
            next();

        } catch (error) {
            console.error('Token verification failed:', error.message);
            // Respond with 401 Unauthorized if verification fails (expired, invalid signature)
            return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
        }
    }

    if (!token) {
        // Respond with 401 Unauthorized if no token was found in the header
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

/**
 * Middleware to restrict access based on user roles.
 * @param {string[]} roles - Array of required role names (e.g., ['Admin', 'Manager']).
 */
export const checkRole = (roles = []) => {
    return (req, res, next) => {
        // If the protect middleware failed, req.user won't exist, which should be caught by protect
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ message: 'Not authorized, user data missing.' });
        }

        // Check if the user's roles (from the JWT payload) include any of the required roles
        const userRoles = req.user.roles;
        const hasRequiredRole = roles.some(requiredRole => userRoles.includes(requiredRole));

        if (hasRequiredRole) {
            // User has one of the required roles, proceed
            next();
        } else {
            // User does not have the necessary role
            return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
        }
    };
};