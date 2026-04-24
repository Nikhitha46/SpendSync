import React from 'react';
import Navigation from './Navigation';

const Layout = ({ children }) => {
    return (
        <div className="flex bg-background h-screen text-slate-100 font-sans p-4 space-x-4">
            <Navigation />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface/50 rounded-2xl shadow-2xl ring-1 ring-white/10 p-6 relative">
                {children}
            </main>
        </div>
    );
};

export default Layout;
