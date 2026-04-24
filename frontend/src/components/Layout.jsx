import React from 'react';
import Navigation from './Navigation';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col md:flex-row bg-background min-h-screen h-screen text-slate-100 font-sans md:p-4 md:space-x-4">
            {/* Sidebar — hidden on mobile, visible on desktop */}
            <div className="hidden md:block md:flex-shrink-0">
                <Navigation />
            </div>

            {/* Main scrollable content area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-surface/50 md:rounded-2xl shadow-2xl md:ring-1 md:ring-white/10 p-4 md:p-6 relative pb-24 md:pb-6">
                {children}
            </main>

            {/* Bottom navigation bar — only visible on mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <Navigation mobile />
            </div>
        </div>
    );
};

export default Layout;
