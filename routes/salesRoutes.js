const express = require('express');
const router = express.Router();
const { getSales } = require('../controllers/salesController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getSales);

module.exports = router;
