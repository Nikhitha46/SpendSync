import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, X, Receipt, ArrowDownRight, ArrowUpRight, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../utils/api';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ amount: '', category: 'Food', date: '', description: '', transactionType: 'debit' });
    const [editingId, setEditingId] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sort, setSort] = useState('date_desc');

    // Budget / vault state
    const [vaultBalance, setVaultBalance] = useState(null);         // all-time net balance
    const [monthlyBudget, setMonthlyBudget] = useState(0);          // budget for selected month
    const [monthlySpent, setMonthlySpent] = useState(0);            // debits already spent this month
    const [monthlyIncome, setMonthlyIncome] = useState(0);          // credits received this month
    const [showBudgetWarning, setShowBudgetWarning] = useState(false); // budget-exceeded popup

    const debitCategories = ['Food', 'Travel', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'];
    const creditCategories = ['Salary', 'Funds', 'Cashback', 'Refund', 'Other Income'];

    // ── Derived checks ────────────────────────────────────────────────────────
    const isDebit = formData.transactionType === 'debit';
    const enteredAmount = parseFloat(formData.amount) || 0;

    // Vault: you can't spend more than what exists overall
    const exceedsVault = isDebit && vaultBalance !== null && enteredAmount > vaultBalance;

    // Monthly savings remaining = budget + income received - debits spent
    const remainingSavings = monthlyBudget + monthlyIncome - monthlySpent;

    // Monthly budget: new expense would exceed what's left in monthly savings
    const exceedsBudget = isDebit && monthlyBudget > 0 && enteredAmount > remainingSavings;

    // ── Fetch expenses list ───────────────────────────────────────────────────
    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/expenses', {
                params: { search, category: categoryFilter, sort }
            });
            setExpenses(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchExpenses();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, categoryFilter, sort]);

    // ── Fetch vault balance (all-time) ────────────────────────────────────────
    useEffect(() => {
        const fetchVault = async () => {
            try {
                const [analyticsRes, budgetsRes] = await Promise.all([
                    api.get('/analytics'),
                    api.get('/budget/all').catch(() => ({ data: [] }))
                ]);
                const totalIncome = analyticsRes.data.totalIncome || 0;
                const totalExpenses = analyticsRes.data.totalExpenses || 0;
                const totalBudgets = (budgetsRes.data || []).reduce((acc, b) => acc + b.amount, 0);
                setVaultBalance(totalBudgets + totalIncome - totalExpenses);
            } catch (err) {
                console.error('Failed to fetch vault balance', err);
            }
        };
        fetchVault();
    }, [expenses]); // re-check after any transaction change

    // ── Fetch monthly budget + current spending when modal opens ─────────────
    useEffect(() => {
        if (!isModalOpen || !formData.date) return;

        const month = formData.date.slice(0, 7); // YYYY-MM
        const fetchMonthlyData = async () => {
            try {
                const [budgetRes, analyticsRes] = await Promise.all([
                    api.get(`/budget?month=${month}`).catch(() => ({ data: null })),
                    api.get(`/analytics?month=${month}`)
                ]);
                setMonthlyBudget(budgetRes.data?.amount || 0);
                setMonthlySpent(analyticsRes.data?.totalExpenses || 0);
                setMonthlyIncome(analyticsRes.data?.totalIncome || 0);
            } catch (err) {
                console.error('Failed to fetch monthly data', err);
            }
        };

        fetchMonthlyData();
    }, [isModalOpen, formData.date]);

    // ── Save transaction ──────────────────────────────────────────────────────
    const saveTransaction = async () => {
        try {
            if (editingId) {
                await api.put(`/expenses/${editingId}`, formData);
            } else {
                await api.post('/expenses', formData);
            }
            setIsModalOpen(false);
            setShowBudgetWarning(false);
            setEditingId(null);
            setFormData({ amount: '', category: 'Food', date: '', description: '', transactionType: 'debit' });
            fetchExpenses();
        } catch (error) {
            console.error('Failed to save expense');
        }
    };

    // ── Form submit: gate on budget check ────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only apply guards for debit transactions (not for edits, where budget context is complex)
        if (isDebit && !editingId && exceedsBudget) {
            setShowBudgetWarning(true);
            return;
        }

        await saveTransaction();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                await api.delete(`/expenses/${id}`);
                fetchExpenses();
            } catch (error) {
                console.error("Failed to delete transaction");
            }
        }
    };

    const openEdit = (expense) => {
        setFormData({
            amount: expense.amount,
            category: expense.category,
            transactionType: expense.transactionType || 'debit',
            date: expense.date.split('T')[0],
            description: expense.description
        });
        setEditingId(expense._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowBudgetWarning(false);
        setEditingId(null);
    };

    const currentCategories = formData.transactionType === 'credit' ? creditCategories : debitCategories;

    return (
        <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-2 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Transaction History</h1>
                    <p className="text-slate-400 mt-1">Manage your income and expenses seamlessly</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setShowBudgetWarning(false);
                        setFormData({ amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], description: '', transactionType: 'debit' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl shadow-lg ring-2 ring-primary/30 transition-all font-semibold transform active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Transaction</span>
                </button>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-surface/50 border border-white/5 p-4 rounded-2xl backdrop-blur-sm shadow-lg">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search description..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <select 
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none appearance-none min-w-[140px] cursor-pointer"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="" className="bg-surface text-slate-200">All Categories</option>
                            <optgroup label="Income" className="text-slate-400">
                                {creditCategories.map(c => <option key={c} value={c} className="bg-surface text-slate-200">{c}</option>)}
                            </optgroup>
                            <optgroup label="Expenses" className="text-slate-400">
                                {debitCategories.map(c => <option key={c} value={c} className="bg-surface text-slate-200">{c}</option>)}
                            </optgroup>
                        </select>
                    </div>
                    <select 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                    >
                        <option value="date_desc" className="bg-surface text-white">Latest First</option>
                        <option value="date_asc" className="bg-surface text-white">Oldest First</option>
                        <option value="amount_desc" className="bg-surface text-white">Highest Amount</option>
                        <option value="amount_asc" className="bg-surface text-white">Lowest Amount</option>
                    </select>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 rounded-2xl overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-16 bg-surface/50 rounded-3xl border border-white/5">
                        <Receipt className="w-16 h-16 opacity-20 mb-4" />
                        <p>No transactions found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {expenses.map((expense) => {
                            const isCredit = expense.transactionType === 'credit';
                            return (
                                <div key={expense._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-surface/80 border border-white/5 rounded-2xl shadow-xl hover:bg-white/5 transition-all group relative overflow-hidden backdrop-blur-sm">
                                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                        <div className={`w-12 h-12 rounded-2xl flex flex-shrink-0 items-center justify-center border ${isCredit ? 'bg-secondary/10 border-secondary/20 text-secondary-400' : 'bg-danger/10 border-danger/20 text-danger-400'}`}>
                                            {isCredit ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg leading-tight">{expense.category}</h4>
                                            <p className="text-sm text-slate-400 flex items-center mt-1">
                                                <span>{new Date(expense.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</span>
                                                {expense.description && (
                                                    <>
                                                        <span className="mx-2 w-1 h-1 bg-slate-600 rounded-full"></span>
                                                        <span className="truncate max-w-[150px] md:max-w-xs">{expense.description}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between sm:flex-col sm:items-end items-center pl-16 sm:pl-0">
                                        <span className={`text-xl font-black tracking-tight ${isCredit ? 'text-secondary-400' : 'text-white'}`}>
                                            {isCredit ? '+' : '-'}₹{expense.amount.toLocaleString()}
                                        </span>
                                        <div className="flex space-x-2 mt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(expense)} className="p-1.5 text-slate-400 hover:text-primary transition-colors bg-white/5 hover:bg-primary/10 rounded-lg">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(expense._id)} className="p-1.5 text-slate-400 hover:text-danger transition-colors bg-white/5 hover:bg-danger/10 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Transaction Modal ──────────────────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal}></div>

                    <div className="bg-surface border border-white/10 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white p-2 bg-white/5 rounded-xl transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, transactionType: 'debit', category: debitCategories[0]})} 
                                    className={`flex-1 py-2 font-semibold rounded-lg transition-colors text-sm ${formData.transactionType === 'debit' ? 'bg-danger/20 text-danger-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Expense
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, transactionType: 'credit', category: creditCategories[0]})} 
                                    className={`flex-1 py-2 font-semibold rounded-lg transition-colors text-sm ${formData.transactionType === 'credit' ? 'bg-secondary/20 text-secondary-300 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Amount field with vault warning */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0"
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:ring-2 outline-none font-bold text-lg transition-all ${
                                        exceedsVault
                                            ? 'border-red-500/60 focus:ring-red-500/40 bg-red-500/5'
                                            : 'border-white/10 focus:ring-primary'
                                    }`}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                />
                                {/* Vault exceeded inline warning */}
                                {exceedsVault && (
                                    <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                                        <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-300 leading-snug">
                                            This amount exceeds your total available vault balance of{' '}
                                            <span className="font-bold text-red-200">₹{vaultBalance.toLocaleString()}</span>.
                                            You don't have enough funds to cover this expense.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        {currentCategories.map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark]"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.description}
                                    placeholder="What was this for?"
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={exceedsVault}
                                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                                        exceedsVault
                                            ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed opacity-60'
                                            : formData.transactionType === 'credit'
                                                ? 'bg-secondary/90 hover:bg-secondary'
                                                : 'bg-primary hover:bg-primary/90'
                                    }`}
                                >
                                    {editingId ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Budget Exceeded Warning Popup ──────────────────────────────── */}
                    {showBudgetWarning && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                            {/* semi-transparent overlay behind the popup (but within the modal backdrop) */}
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                            <div className="relative z-30 w-full max-w-sm bg-[#1a1f2e] border border-amber-500/30 rounded-3xl p-6 shadow-2xl ring-1 ring-amber-400/20 animate-in fade-in zoom-in-95 duration-200">
                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-white text-center mb-2">Savings Limit Exceeded!</h3>

                                {/* Body */}
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-4">
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-400">Monthly Budget</span>
                                        <span className="font-semibold text-white">₹{monthlyBudget.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-400">Income This Month</span>
                                        <span className="font-semibold text-green-400">+₹{monthlyIncome.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-slate-400">Already Spent</span>
                                        <span className="font-semibold text-red-400">-₹{monthlySpent.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-sm">
                                        <span className="text-slate-300 font-medium">Savings Remaining</span>
                                        <span className="font-bold text-amber-300">₹{remainingSavings.toLocaleString()}</span>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-center text-sm leading-relaxed">
                                    This expense of{' '}
                                    <span className="font-bold text-amber-300">₹{enteredAmount.toLocaleString()}</span>{' '}
                                    exceeds your remaining monthly savings.
                                </p>
                                <p className="text-slate-400 text-center text-sm mt-2 mb-6">
                                    Do you still want to proceed anyway?
                                </p>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowBudgetWarning(false);
                                            setIsModalOpen(false);
                                        }}
                                        className="flex-1 px-4 py-3 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                                    >
                                        No, Cancel
                                    </button>
                                    <button
                                        onClick={saveTransaction}
                                        className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all"
                                    >
                                        Yes, Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Expenses;
