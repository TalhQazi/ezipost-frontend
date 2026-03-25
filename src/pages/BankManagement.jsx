import React, { useState, useEffect } from 'react';
import { Building2, User, CreditCard, Hash, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Table from '../components/table';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:5001/api';

const BankManagement = () => {
    const [banks, setBanks] = useState([]);
    const [formData, setFormData] = useState({
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolder: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const res = await fetch(`${API_BASE}/bank`);
            if (res.ok) {
                const data = await res.json();
                setBanks(data);
            }
        } catch (err) {
            console.error('Failed to fetch banks:', err);
        }
    };

    const handleAddBank = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bank`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Bank account registered successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchBanks();
                setFormData({ accountNumber: '', bankName: '', ifscCode: '', accountHolder: '' });
            }
        } catch (err) {
            console.error('Add bank error:', err);
            Swal.fire('Error', 'Failed to register bank account', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBank = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_BASE}/bank/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Deleted!', 'Bank account has been deleted.', 'success');
                    fetchBanks();
                }
            } catch (err) {
                console.error('Delete bank error:', err);
                Swal.fire('Error', 'Failed to delete bank account', 'error');
            }
        }
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Bank Account Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Register and manage customer bank accounts for escrow funding.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-sm">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FORM SECTION */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-[#F26522]/20 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Register New Account</h3>
                    </div>

                    <form onSubmit={handleAddBank} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <User size={14} className="text-primary" /> Account Holder Name
                            </label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                value={formData.accountHolder} 
                                onChange={e => setFormData({...formData, accountHolder: e.target.value})} 
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Building2 size={14} className="text-primary" /> Bank Name
                            </label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                value={formData.bankName} 
                                onChange={e => setFormData({...formData, bankName: e.target.value})} 
                                placeholder="e.g. HDFC Bank"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <CreditCard size={14} className="text-primary" /> Account Number
                            </label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                value={formData.accountNumber} 
                                onChange={e => setFormData({...formData, accountNumber: e.target.value})} 
                                placeholder="Enter account number"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <Hash size={14} className="text-primary" /> IFSC Code
                            </label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                value={formData.ifscCode} 
                                onChange={e => setFormData({...formData, ifscCode: e.target.value})} 
                                placeholder="e.g. HDFC0001234"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 mt-2"
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER BANK ACCOUNT'}
                        </button>
                    </form>
                </div>

                {/* TABLE SECTION */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-[#F26522]/20 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F26522]/10 text-[#F26522] rounded-xl flex items-center justify-center">
                                <Building2 size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">Registered Accounts</h3>
                        </div>
                        <span className="bg-[#F26522]/10 text-[#F26522] text-xs font-bold px-3 py-1 rounded-full border border-[#F26522]/20">
                            {banks.length} TOTAL
                        </span>
                    </div>

                    <div className="table-scroll-wrapper overflow-x-auto">
                        {banks.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm font-medium">No bank accounts registered yet.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 rounded-xl">
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase first:rounded-l-xl last:rounded-r-xl">Holder Name</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Bank</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Account No.</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">IFSC</th>
                                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {banks.map((bank, index) => (
                        <tr key={bank._id} className="group hover:bg-[#F8FAFC] transition-colors">
                                            <td className="px-4 py-4 text-sm font-bold text-slate-700">{bank.accountHolder}</td>
                                            <td className="px-4 py-4 text-sm text-slate-600 font-medium">{bank.bankName}</td>
                                            <td className="px-4 py-4 text-sm font-mono text-slate-500 tracking-wider">****{bank.accountNumber.slice(-4)}</td>
                                            <td className="px-4 py-4 text-sm text-slate-500 font-medium">{bank.ifscCode}</td>
                                            <td className="px-4 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteBank(bank._id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Account"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankManagement;
