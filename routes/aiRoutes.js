const express = require('express');
const router = express.Router();
const { generateReport, generateEmail, generatePost, summarizeInvoice } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/insights', protect, generateReport);
router.post('/email', protect, generateEmail);
router.post('/post', protect, generatePost);
router.post('/invoice', protect, summarizeInvoice);

module.exports = router;
