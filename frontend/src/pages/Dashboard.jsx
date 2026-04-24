import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { IndianRupee, TrendingUp, AlertCircle, Wallet, PieChart as PieChartIcon, ArrowRight } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className={`absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500`}></div>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight flex items-center">
                    <IndianRupee className="w-5 h-5 mr-1 text-slate-300" /> {value.toLocaleString()}
                </h3>
            </div>
            <div className={`p-3 bg-white/5 rounded-xl border border-white/5 ${colorClass}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [budget, setBudget] = useState(null);
    const [allTimeSavings, setAllTimeSavings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    useEffect(() => {
        const fetchAllTimeStats = async () => {
            try {
                const [allTimeAnalyticsRes, allBudgetsRes] = await Promise.all([
                    api.get(`/analytics`),
                    api.get(`/budget/all`).catch(() => ({ data: [] }))
                ]);
                const allIncome = allTimeAnalyticsRes.data.totalIncome || 0;
                const allExpenses = allTimeAnalyticsRes.data.totalExpenses || 0;
                const allBudgets = (allBudgetsRes.data || []).reduce((acc, b) => acc + b.amount, 0);

                setAllTimeSavings(allBudgets + allIncome - allExpenses);
            } catch (error) {
                console.error("Failed to load all time stats", error);
            }
        };
        fetchAllTimeStats();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async (targetMonth) => {
            try {
                const [analyticsRes, budgetRes] = await Promise.all([
                    api.get(`/analytics?month=${targetMonth}`),
                    api.get(`/budget?month=${targetMonth}`).catch(() => ({ data: null }))
                ]);
                
                setAnalytics(analyticsRes.data);
                setBudget(budgetRes.data?.amount || 0);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData(month);
    }, [month]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { totalExpenses, totalIncome } = analytics || { totalExpenses: 0, totalIncome: 0 };
    const budgetUtilization = budget > 0 ? (totalExpenses / budget) * 100 : 0;
    const netSavings = (budget || 0) + totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-extrabold text-white mb-2">Overview</h1>
                    <p className="text-slate-400">Here's your financial summary for {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <input 
                    type="month" 
                    className="w-full md:w-auto bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary outline-none [color-scheme:dark]"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                />
            </header>

            {budget > 0 && budgetUtilization > 90 && (
                <div className="bg-danger/20 border border-danger/50 rounded-2xl p-4 flex items-center space-x-3 text-danger-300">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="font-medium">You have consumed {budgetUtilization.toFixed(1)}% of your monthly budget!</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard 
                    title="Total Income (Credits)" 
                    value={totalIncome} 
                    icon={TrendingUp} 
                    colorClass="text-secondary"
                />
                <DashboardCard 
                    title="Total Debits" 
                    value={totalExpenses} 
                    icon={IndianRupee} 
                    colorClass="text-danger"
                />
                <DashboardCard 
                    title="Net Savings" 
                    value={netSavings} 
                    icon={Wallet} 
                    colorClass="text-primary"
                />
                <DashboardCard 
                    title="Remaining Budget" 
                    value={Math.max(0, (budget || 0) - totalExpenses)} 
                    icon={PieChartIcon} 
                    colorClass="text-teal-400"
                />
            </div>

            <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none -mt-20 -mr-20"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <div className="flex items-center space-x-3 mb-2">
                           <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                               <Wallet className="w-8 h-8 text-emerald-400" />
                           </div>
                           <h2 className="text-2xl font-bold text-white tracking-wide">Lifetime Wealth Vault</h2>
                        </div>
                        <p className="text-emerald-200/60 text-sm max-w-md ml-14">This represents your combined portfolio savings trajectory since you began using SpendSync.</p>
                    </div>
                    <div className="mt-8 md:mt-0 bg-black/20 px-8 py-5 rounded-2xl border border-white/5 backdrop-blur-sm self-stretch md:self-auto flex items-center justify-center">
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center">
                            <IndianRupee className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 mr-1 opacity-80" />
                            {allTimeSavings.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>
            
            <Link to="/analytics" className="block text-center p-8 bg-surface/50 hover:bg-surface border border-white/5 hover:border-primary/30 rounded-3xl shadow-xl transition-all duration-300 group">
                 <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                     Want to see historic graphs?
                     <ArrowRight className="w-5 h-5 ml-2 text-primary group-hover:translate-x-2 transition-transform" />
                 </h2>
                 <p className="text-slate-400 group-hover:text-slate-300 transition-colors">Click here to head to the Analytics page to view categorized models and trends.</p>
            </Link>
        </div>
    );
};

export default Dashboard;
