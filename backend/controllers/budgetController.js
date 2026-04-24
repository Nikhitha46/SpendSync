const Budget = require('../models/Budget');

// @desc    Get budget for a specific month
// @route   GET /api/budget?month=YYYY-MM
// @access  Private
const getBudget = async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) {
            return res.status(400).json({ message: 'Month query parameter is required (YYYY-MM)' });
        }

        const budget = await Budget.findOne({ user: req.user._id, month });
        
        if (budget) {
            res.status(200).json(budget);
        } else {
            res.status(404).json({ message: 'Budget not set for this month' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Set or update budget for a month
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res) => {
    try {
        const { month, amount } = req.body;

        if (!month || amount === undefined) {
            return res.status(400).json({ message: 'Month and amount are required' });
        }

        let budget = await Budget.findOne({ user: req.user._id, month });

        if (budget) {
            // Update existing
            budget.amount = amount;
            const updatedBudget = await budget.save();
            res.status(200).json(updatedBudget);
        } else {
            // Create new
            budget = new Budget({
                user: req.user._id,
                month,
                amount
            });
            const createdBudget = await budget.save();
            res.status(201).json(createdBudget);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all budgets for a user
// @route   GET /api/budget/all
// @access  Private
const getAllBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id }).sort({ month: -1 });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBudget,
    setBudget,
    getAllBudgets
};
