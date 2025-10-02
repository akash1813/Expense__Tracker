const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { setMonthlyBudget, getMonthlyBudget } = require('../controllers/budgetController');

const router = express.Router();

router.get('/', protect, getMonthlyBudget);
router.post('/', protect, setMonthlyBudget);

module.exports = router;
