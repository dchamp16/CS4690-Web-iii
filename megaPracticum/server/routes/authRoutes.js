import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, tenant } = req.body;
    console.log('Login attempt:', { username, tenant });

    // Normalize tenant
    const normalizedTenant = tenant.toUpperCase() === 'UOFU' ? 'UofU' : tenant.toUpperCase();

    // Find user with all fields
    const user = await User.findOne({
      username,
      tenant: normalizedTenant
    });

    if (!user) {
      console.log('User not found:', { username, tenant: normalizedTenant });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create user response object with all necessary fields
    const userResponse = {
      _id: user._id,
      username: user.username,
      role: user.role,
      tenant: user.tenant,
      uvuId: user.uvuId,
      uofuId: user.uofuId
    };

    // Generate token with all user fields
    const token = jwt.sign(
        {
          ...userResponse,
          id: user._id // Include id for backward compatibility
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    console.log('Login successful, sending response:', { user: userResponse });
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;