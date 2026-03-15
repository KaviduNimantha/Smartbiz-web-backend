const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan, selectPlan } = require('../controllers/subscriptionController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Publicly available to logged-in users (both Admin and Owner)
router.get('/', protect, getPlans);

// Admin-only routes
router.post('/', protect, admin, createPlan);
router.put('/:id', protect, admin, updatePlan);
router.delete('/:id', protect, admin, deletePlan);

// Owner-only route to select a plan
router.post('/select', protect, selectPlan);

module.exports = router;
