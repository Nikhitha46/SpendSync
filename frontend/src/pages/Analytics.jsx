import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [budget, setBudget] = useState(0);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

    const fetchDashboardData = async (targetMonth) => {
        try {
            setLoading(true);
            const [analyticsRes, budgetRes] = await Promise.all([
                api.get(`/analytics?month=${targetMonth}`),
                api.get(`/budget?month=${targetMonth}`).catch(() => ({ data: null }))
            ]);
            setAnalytics(analyticsRes.data);
            setBudget(budgetRes.data?.amount || 0);
        } catch (error) {
            console.error("Failed to load analytics data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(month);
    }, [month]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { categoryBreakdown, dailyBurn, totalExpenses, totalIncome } = analytics || { categoryBreakdown: [], dailyBurn: [], totalExpenses: 0, totalIncome: 0 };
    const netSavings = (budget || 0) + totalIncome - totalExpenses;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:justify-between items-start md:items-end mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-white flex items-center">
                        <PieChartIcon className="w-8 h-8 mr-3 text-secondary" />
                        Analytics
                    </h1>
                    <p className="text-slate-400 mt-1">Deep dive into your financial habits</p>
                </div>
                <input 
                    type="month" 
                    className="w-full md:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark]"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Monthly Budget</p>
                    <h4 className="text-2xl font-bold text-white tracking-tight">₹{(budget || 0).toLocaleString()}</h4>
                </div>
                <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Income</p>
                    <h4 className="text-2xl font-bold text-white tracking-tight">₹{totalIncome.toLocaleString()}</h4>
                </div>
                <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Debits</p>
                    <h4 className="text-2xl font-bold text-white tracking-tight">₹{totalExpenses.toLocaleString()}</h4>
                </div>
                <div className="bg-surface border border-white/5 p-6 rounded-2xl shadow-xl">
                    <p className="text-slate-400 text-sm font-medium mb-1">Net Savings</p>
                    <h4 className={`text-2xl font-bold tracking-tight ${netSavings >= 0 ? 'text-primary' : 'text-danger'}`}>
                        {netSavings >= 0 ? '+' : ''}₹{netSavings.toLocaleString()}
                    </h4>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Category Breakdown */}
                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-2xl relative">
                    <h3 className="text-lg font-bold text-white mb-6">Spending by Category (Debits)</h3>
                    {categoryBreakdown.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        nameKey="name"
                                        stroke="transparent"
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff', padding: '10px 14px' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value, name) => {
                                            const total = categoryBreakdown.reduce((sum, item) => sum + item.value, 0);
                                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                            return [`₹${value.toLocaleString()} (${pct}%)`, name];
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            No expense data available this month
                        </div>
                    )}
                </div>

                {/* Daily Spending Trend */}
                <div className="bg-surface border border-white/5 rounded-3xl p-6 shadow-2xl relative">
                    <h3 className="text-lg font-bold text-white mb-6">Daily Spending Trend (Debits)</h3>
                    {dailyBurn.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyBurn}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#94A3B8" 
                                        tickFormatter={(str) => {
                                            const d = new Date(str);
                                            return d.getDate();
                                        }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        stroke="#94A3B8" 
                                        tickFormatter={(val) => `₹${val}`}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                        width={60}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                        formatter={(value) => [`₹${value}`, 'Amount']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#3B82F6" 
                                        strokeWidth={4}
                                        dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            No trends to display
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
