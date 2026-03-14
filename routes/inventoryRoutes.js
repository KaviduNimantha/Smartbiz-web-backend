const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/inventoryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/products', protect, getProducts);

module.exports = router;
