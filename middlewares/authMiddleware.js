const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // If the token is for the hardcoded admin, skip the DB check
      if (decoded.role === 'ADMIN' && decoded.id === 0) {
          req.user = decoded;
          return next();
      }

      // Ensure the user still exists and is active
      const user = await User.findByPk(decoded.id);
      if (!user) {
         return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (!user.isActive) {
         return res.status(403).json({ success: false, message: 'Account deactivated. Please contact an admin.' });
      }

      // Add the user data (id, role) to the request object
      req.user = { id: user.id, role: user.role };
      
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
