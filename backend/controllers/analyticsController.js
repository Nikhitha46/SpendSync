const Expense = require('../models/Expense');

// @desc    Get expense analytics
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        
        const query = { user: req.user._id };
        
        if (month) {
            const startDate = new Date(`${month}-01T00:00:00.000Z`);
            const endMonth = new Date(startDate);
            endMonth.setMonth(endMonth.getMonth() + 1);
            query.date = { $gte: startDate, $lt: endMonth };
        }

        const expenses = await Expense.find(query);

        let totalExpenses = 0;
        let totalIncome = 0;
        
        // Category breakdown
        const categoryData = {};
        expenses.forEach(exp => {
            if (exp.transactionType === 'credit') {
                totalIncome += exp.amount;
            } else {
                totalExpenses += exp.amount;
                if (!categoryData[exp.category]) {
                    categoryData[exp.category] = 0;
                }
                categoryData[exp.category] += exp.amount;
            }
        });

        // Group by date (for line charts)
        const dateData = {};
        expenses.forEach(exp => {
            if (exp.transactionType === 'credit') return; // Only track daily burn for expenses

            const dateStr = exp.date.toISOString().split('T')[0];
            if (!dateData[dateStr]) {
                dateData[dateStr] = 0;
            }
            dateData[dateStr] += exp.amount;
        });

        res.status(200).json({
            totalExpenses,
            totalIncome,
            categoryBreakdown: Object.keys(categoryData).map(key => ({
                name: key,
                value: categoryData[key]
            })),
            dailyBurn: Object.keys(dateData).map(key => ({
                date: key,
                amount: dateData[key]
            })).sort((a,b) => new Date(a.date) - new Date(b.date))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalytics
};
