const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCategoryBreakdown } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/category-breakdown', protect, getCategoryBreakdown);

module.exports = router;
