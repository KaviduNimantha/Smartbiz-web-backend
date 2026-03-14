const express = require('express');
const router = express.Router();
const { getAllUsers, getUserProfile, toggleUserStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes require authentication AND admin privileges
router.use(protect, admin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserProfile);
router.put('/users/:id/status', toggleUserStatus);

module.exports = router;
