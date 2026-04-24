const express = require('express');
const { getBudget, setBudget, getAllBudgets } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/all', protect, getAllBudgets);
router.route('/')
    .get(protect, getBudget)
    .post(protect, setBudget);

module.exports = router;
