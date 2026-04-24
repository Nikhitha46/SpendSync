import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Target, AlertTriangle, CheckCircle, Save, Calendar, IndianRupee } from 'lucide-react';

const Budgets = () => {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [currentBudget, setCurrentBudget] = useState(null);
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [budgetsHistory, setBudgetsHistory] = useState([]);

    const fetchBudgetsHistory = async () => {
        try {
            const { data } = await api.get('/budget/all');
            setBudgetsHistory(data);
        } catch (error) {
            console.error("Failed to load budget history", error);
        }
    }

    const fetchBudget = async (selectedMonth) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/budget?month=${selectedMonth}`);
            setCurrentBudget(data);
            setAmount(data.amount.toString());
        } catch (error) {
            setCurrentBudget(null);
            setAmount('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudget(month);
    }, [month]);

    useEffect(() => {
        fetchBudgetsHistory();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        if (!amount || Number(amount) < 0) {
            setMessage({ text: 'Please enter a valid amount', type: 'error' });
            return;
        }

        try {
            setSaving(true);
            await api.post('/budget', { month, amount: Number(amount) });
            setMessage({ text: 'Budget configured successfully!', type: 'success' });
            fetchBudget(month);
            fetchBudgetsHistory(); // refresh list
        } catch (error) {
            setMessage({ text: 'Failed to configure budget', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-white">Budgets</h1>
                <p className="text-slate-400 mt-1">Set monthly limits to keep your finances in check</p>
            </header>

            <div className="bg-surface border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-1">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Target Month</label>
                            <input 
                                type="month" 
                                className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark]"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                            />
                        </div>

                        <div className="mb-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                            {loading ? (
                                <div className="animate-pulse flex space-x-4">
                                    <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
                                </div>
                            ) : currentBudget ? (
                                <div>
                                    <div className="flex items-center space-x-2 text-secondary mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <h3 className="font-semibold text-lg">Active Budget Configuration</h3>
                                    </div>
                                    <p className="text-slate-400">Target limit for {new Date(month + '-01').toLocaleDateString(undefined, {month: 'long', year: 'numeric'})} is set to <strong className="text-white text-lg ml-1">₹{currentBudget.amount.toLocaleString()}</strong>.</p>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center space-x-2 text-primary mb-2">
                                        <Target className="w-5 h-5" />
                                        <h3 className="font-semibold text-lg">No Budget Found</h3>
                                    </div>
                                    <p className="text-slate-400">Configure a spending limit for this target month.</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Update Budget Limit (₹)</label>
                                <input 
                                    type="number" 
                                    className="w-full max-w-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none text-2xl font-bold"
                                    placeholder="e.g. 50000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                />
                            </div>
                            
                            {message.text && (
                                <div className={`p-3 rounded-lg flex items-center space-x-2 w-full max-w-xs ${message.type === 'success' ? 'bg-secondary/20 text-secondary-300 border border-secondary/30' : 'bg-danger/20 text-danger-300 border border-danger/30'}`}>
                                    {message.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-6 py-3 rounded-xl shadow-lg ring-2 ring-primary/30 transition-all font-semibold transform active:scale-[0.98] disabled:opacity-50 mt-4"
                            >
                                <Save className="w-5 h-5" />
                                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                            </button>
                        </form>
                    </div>

                    <div className="w-full md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-8 mt-8 md:mt-0">
                        <div className="text-center p-6 bg-primary/10 rounded-2xl border border-primary/20">
                            <Target className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
                            <h4 className="text-white font-bold mb-2">Pro Tip</h4>
                            <p className="text-slate-400 text-sm">Reviewing your previous months' analytics can help you set realistic financial goals to save progressively.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historic Budgets List */}
            {budgetsHistory.length > 0 && (
                <div>
                   <h2 className="text-xl font-bold text-white mb-4 px-2 flex items-center">
                       <Calendar className="w-6 h-6 mr-2 text-primary" />
                       Configured Budgets History
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {budgetsHistory.map((b) => (
                           <div key={b._id} className="bg-surface/80 border border-white/5 p-5 rounded-2xl shadow-xl flex items-center space-x-4">
                               <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0 text-slate-300">
                                   <Target className="w-6 h-6" />
                               </div>
                               <div>
                                   <p className="text-slate-400 text-sm font-medium mb-1">
                                       {new Date(b.month + '-01').toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}
                                   </p>
                                   <p className="text-white font-bold flex items-center text-lg tracking-tight">
                                      <IndianRupee className="w-4 h-4 mr-0.5 text-secondary" /> {b.amount.toLocaleString()}
                                   </p>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
