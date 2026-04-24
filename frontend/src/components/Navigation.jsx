import React, { useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Receipt, PieChart, Wallet, LogOut, User } from 'lucide-react';

const Navigation = ({ mobile = false }) => {
    const { logout, user } = useContext(AuthContext);

    const navItems = [
        { path: '/', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/expenses', name: 'Expenses', icon: Receipt },
        { path: '/analytics', name: 'Analytics', icon: PieChart },
        { path: '/budgets', name: 'Budgets', icon: Wallet },
        { path: '/profile', name: 'Profile', icon: User },
    ];

    // ── Mobile Bottom Navigation Bar ─────────────────────────────────────────
    if (mobile) {
        return (
            <nav className="bg-surface/95 backdrop-blur-xl border-t border-white/10 shadow-2xl px-2 py-2 safe-area-pb">
                <div className="flex items-center justify-around">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${
                                    isActive
                                        ? 'text-primary bg-primary/10'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                                    <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-primary' : ''}`}>
                                        {item.name}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    {/* Sign out as icon in bottom bar */}
                    <button
                        onClick={logout}
                        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-danger/70 hover:text-danger hover:bg-danger/10 transition-all duration-200 min-w-[52px]"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-[10px] font-semibold tracking-wide">Out</span>
                    </button>
                </div>
            </nav>
        );
    }

    // ── Desktop Sidebar ───────────────────────────────────────────────────────
    return (
        <aside className="w-64 h-full bg-surface flex flex-col rounded-2xl shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Logo */}
            <div className="h-24 flex items-center justify-center border-b border-white/5 mx-6">
                <Link to="/" className="flex items-center space-x-2 cursor-pointer">
                    <Wallet className="w-8 h-8 text-primary" />
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transform hover:scale-105 transition-transform">
                        SpendSync
                    </h1>
                </Link>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-8 space-y-3 relative z-10">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                                isActive
                                    ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner ring-1 ring-primary/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:px-5'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                        <span className="font-semibold">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User + Sign out */}
            <div className="p-4 border-t border-white/5 mx-2 bg-gradient-to-t from-black/20 to-transparent">
                <div className="mb-4 px-2 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                        <span className="text-primary font-bold">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Session</p>
                        <p className="font-semibold text-slate-200 truncate">{user?.name || 'Guest'}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center justify-center space-x-2 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-all duration-300 py-3 rounded-xl font-semibold shadow-lg hover:shadow-danger/20"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Navigation;
