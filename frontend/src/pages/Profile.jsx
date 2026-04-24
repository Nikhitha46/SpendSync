import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { UploadCloud, DownloadCloud, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [importLoading, setImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState(null);
    const fileInputRef = useRef(null);

    const handleExport = async () => {
        try {
            const response = await api.get('/excel/export', { responseType: 'blob' });
            
            // Create a link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'expenses.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Failed to export', error);
            alert("Export failed");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImportLoading(true);
        setImportMessage(null);

        try {
            const { data } = await api.post('/excel/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImportMessage({ type: 'success', text: data.message });
        } catch (error) {
            setImportMessage({ type: 'error', text: error.response?.data?.message || 'Failed to import' });
        } finally {
            setImportLoading(false);
            e.target.value = null; // reset input
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold text-white">Profile & Settings</h1>
                <p className="text-slate-400 mt-1">Manage your account and data tools</p>
            </header>

            {/* Profile Info */}
            <div className="bg-surface/80 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 text-sm">
                        {user?.name?.charAt(0)}
                    </span>
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                        <p className="text-lg font-semibold text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">{user?.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <p className="text-lg font-semibold text-white bg-white/5 px-4 py-3 rounded-xl border border-white/10">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-surface/80 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-1/4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl pointer-events-none"></div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <FileSpreadsheet className="w-6 h-6 text-secondary mr-2" />
                    Data Management
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    
                    {/* Export */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center"><DownloadCloud className="w-5 h-5 mr-2 text-primary" /> Export Data</h3>
                            <p className="text-sm text-slate-400 mb-6">Download all your personal expenses into a structured Excel (.xlsx) file for local record keeping.</p>
                        </div>
                        <button 
                            onClick={handleExport}
                            className="w-full flex items-center justify-center space-x-2 bg-primary/20 hover:bg-primary text-white py-3 rounded-xl transition-all duration-300 font-semibold border border-primary/30"
                        >
                            <DownloadCloud className="w-5 h-5" />
                            <span>Download Excel File</span>
                        </button>
                    </div>

                    {/* Import */}
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-white mb-2 flex items-center"><UploadCloud className="w-5 h-5 mr-2 text-secondary" /> Import Data</h3>
                            <p className="text-sm text-slate-400 mb-4">Bulk upload expenses using an Excel file. Make sure columns exactly match: Amount, Category, Date, Description.</p>
                            
                            {importMessage && (
                                <div className={`mb-4 p-3 rounded-xl text-sm flex items-start space-x-2 ${importMessage.type === 'success' ? 'bg-secondary/20 text-secondary-300' : 'bg-danger/20 text-danger-300'}`}>
                                    {importMessage.type === 'success' ? <Check className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                    <span className="mt-0.5">{importMessage.text}</span>
                                </div>
                            )}
                        </div>
                        
                        <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        <button 
                            onClick={handleImportClick}
                            disabled={importLoading}
                            className="w-full flex items-center justify-center space-x-2 bg-secondary/20 hover:bg-secondary text-white py-3 rounded-xl transition-all duration-300 font-semibold border border-secondary/30 disabled:opacity-50"
                        >
                            <UploadCloud className="w-5 h-5" />
                            <span>{importLoading ? 'Uploading...' : 'Upload Excel File'}</span>
                        </button>
                    </div>

                </div>
            </div>
            
        </div>
    );
};

export default Profile;
