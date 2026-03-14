const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Configure admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@smartbiz.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for Admin Login (Hardcoded)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateToken(0, 'ADMIN'); // id 0 for admin
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        data: {
          user: { id: 0, email: ADMIN_EMAIL, role: 'ADMIN', ownerName: 'Admin' },
          token,
        },
      });
    }

    // 2. Check for Business Owner Login
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Please contact an admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          businessName: user.businessName,
          ownerName: user.ownerName,
        },
        token,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { businessName, ownerName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      businessName,
      ownerName,
      email,
      password: hashedPassword,
      role: 'OWNER',
    });



    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please login.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          businessName: newUser.businessName,
          ownerName: newUser.ownerName,
        },
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  login,
  register,
};
