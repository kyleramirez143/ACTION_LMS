// backend/controllers/authController.js (Now using ESM syntax)

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// IMPORTANT: Adjust the import path and name based on how your index.js exports the models.
// If your index.js uses module.exports = db (where db is { User, Password, ... }), 
// you might need to use a special import pattern or rename index.js to index.cjs.
// However, the cleanest way is often to import the db object and destructure it.
import db from '../models/index.cjs';

const { User, Password, Role } = db;

// Ensure JWT_SECRET is loaded from your .env 
const JWT_SECRET = process.env.JWT_SECRET || 'a_secure_default_secret_for_dev';

// --- The Login Handler Function ---
// Use 'export const' for named exports
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // 1. Find User, their current Password, and all associated Roles
    const user = await User.findOne({
      where: { email: email},
      include: [
        {
          model: Password,
          as: 'currentPassword',
          where: { is_current: true },
          attributes: ['password']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['name']
        }
      ]
    });

    // 2. Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Check if user is active (deactivated users cannot login)
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account Deactivated. Please contact your Manager.' });
    }

    if (!user || !user.currentPassword || !user.currentPassword.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    console.log('--- DIAGNOSTIC LOG START ---');
    console.log('User found. Current Password object:', user.currentPassword);
    console.log('--- DIAGNOSTIC LOG END ---');

    const hashedPassword = user.currentPassword.get('password');

    // 2. Password Verification
    const isPasswordValid = await bcrypt.compare(
      password,
      hashedPassword
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 3. Token Generation (Success)
    const userRoles = user.roles.map(role => role.name);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      roles: userRoles,
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Send Response
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        roles: userRoles
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};