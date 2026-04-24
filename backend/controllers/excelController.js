const Expense = require('../models/Expense');
const xlsx = require('xlsx');

// @desc    Export expenses to excel
// @route   GET /api/excel/export
// @access  Private
const exportToExcel = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });

        const data = expenses.map(exp => ({
            Amount: exp.amount,
            Category: exp.category,
            Date: exp.date.toISOString().split('T')[0],
            Description: exp.description || ''
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expenses");

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Import expenses from excel
// @route   POST /api/excel/import
// @access  Private
const importFromExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an excel file' });
        }

        const wb = xlsx.read(req.file.buffer, { type: 'buffer' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        
        const data = xlsx.utils.sheet_to_json(ws);

        const expensesToInsert = data.map(row => ({
            user: req.user._id,
            amount: row.Amount,
            category: row.Category,
            date: new Date(row.Date || Date.now()),
            description: row.Description || ''
        }));

        await Expense.insertMany(expensesToInsert);
        
        res.status(200).json({ message: `${expensesToInsert.length} expenses imported successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    exportToExcel,
    importFromExcel
};
