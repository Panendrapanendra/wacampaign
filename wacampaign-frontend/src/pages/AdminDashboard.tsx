import { useState, useEffect } from 'react';
import { 
  UserPlus, Trash2, Copy, Check, LogOut, 
  Edit2, X, Users as UsersIcon, Key as KeyIcon, UserX 
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // TABS STATE
  const [activeTab, setActiveTab] = useState<'licenses' | 'users'>('licenses');

  // LICENSE MANAGEMENT STATE
  const [emailInput, setEmailInput] = useState('');
  const [daysInput, setDaysInput] = useState('30'); 
  const [limitInput, setLimitInput] = useState('500');
  const [keysList, setKeysList] = useState<Record<string, { days: number; maxMessages: number; assignedEmail: string | null; usedBy: string | null }>>({});
  const [generatedKeyDisplay, setGeneratedKeyDisplay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDays, setEditDays] = useState('');
  const [editLimit, setEditLimit] = useState('');

  // USER MANAGEMENT STATE
  const [dbUsers, setDbUsers] = useState<{ name: string; email: string; phone: string }[]>([]);

  // INITIALIZE KEYS
  useEffect(() => {
    const stored = localStorage.getItem('wa_master_keys_db');
    if (stored) {
      setKeysList(JSON.parse(stored));
    }
  }, []);

  // FETCH USERS FROM UNIFIED NODE BACKEND (PORT 3000)
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          const response = await fetch('http://127.0.0.1:3000/api/users/');
          if (response.ok) {
            const data = await response.json();
            setDbUsers(data);
            return;
          }
        } catch (err) {
          console.warn('Backend not reachable on port 3000. Showing fallback data.');
        }
        
        // Fallback UI data if backend is not started
        setDbUsers([
          { name: 'Venu', email: 'panendra007@gmail.com', phone: '+91 9876543210' },
          { name: 'Client Demo', email: 'client@example.com', phone: '+1 234567890' }
        ]);
      };
      
      fetchUsers();
    }
  }, [activeTab]);

  // ================= LICENSE MANAGEMENT LOGIC =================
  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert('Please enter the user email address.');
      return;
    }
    const parsedDays = parseInt(daysInput);
    if (isNaN(parsedDays) || parsedDays <= 0) {
      alert('Please enter a valid positive number for Access Duration (Days).');
      return;
    }
    const parsedLimit = parseInt(limitInput);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      alert('Please enter a valid positive number for Message Limit.');
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newKey = `WAC-${randomSuffix}-${parsedDays}D-${Date.now().toString().slice(-4)}`;

    const updatedDb = { ...keysList };
    updatedDb[newKey] = {
      days: parsedDays,
      maxMessages: parsedLimit,
      assignedEmail: emailInput.trim(),
      usedBy: null
    };

    localStorage.setItem('wa_master_keys_db', JSON.stringify(updatedDb));
    setKeysList(updatedDb);
    setGeneratedKeyDisplay(newKey);
    setEmailInput('');
  };

  const handleDeleteKey = (keyToRemove: string) => {
    if (!window.confirm('Are you sure you want to delete this key?')) return;
    const updatedDb = { ...keysList };
    delete updatedDb[keyToRemove];
    localStorage.setItem('wa_master_keys_db', JSON.stringify(updatedDb));
    setKeysList(updatedDb);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditClick = (key: string, currentDays: number, currentLimit: number) => {
    setEditingKey(key);
    setEditDays(currentDays.toString());
    setEditLimit(currentLimit.toString());
  };

  const handleSaveEdit = (keyToUpdate: string) => {
    const parsedDays = parseInt(editDays);
    const parsedLimit = parseInt(editLimit);

    if (isNaN(parsedDays) || parsedDays <= 0 || isNaN(parsedLimit) || parsedLimit <= 0) {
      alert('Please enter valid positive numbers.');
      return;
    }

    const updatedDb = { ...keysList };
    updatedDb[keyToUpdate] = {
      ...updatedDb[keyToUpdate],
      days: parsedDays,
      maxMessages: parsedLimit
    };

    localStorage.setItem('wa_master_keys_db', JSON.stringify(updatedDb));
    setKeysList(updatedDb);

    const activeKey = localStorage.getItem('wa_license_key');
    if (activeKey === keyToUpdate) {
      const newExpiryTime = Date.now() + (parsedDays * 24 * 60 * 60 * 1000);
      localStorage.setItem('wa_license_expiry', String(newExpiryTime));
      localStorage.setItem('wa_license_max_messages', String(parsedLimit));
    }
    setEditingKey(null);
  };

  // ================= USER MANAGEMENT LOGIC =================
  const handleDeleteUser = async (emailToDelete: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the account: ${emailToDelete}?`)) return;

    // 1. Delete from Unified Node backend (Port 3000)
    try {
      const response = await fetch(`http://127.0.0.1:3000/api/users/${encodeURIComponent(emailToDelete)}/`, {
        method: 'DELETE'
      });
      if (!response.ok) console.warn('Backend deletion request failed.');
    } catch (err) {
      console.warn('Backend not connected on port 3000.');
    }

    // 2. Remove user from local UI state
    setDbUsers(prev => prev.filter(u => u.email !== emailToDelete));

    // 3. Automatically Revoke any license keys assigned to this user
    const updatedDb = { ...keysList };
    let keysModified = false;
    Object.keys(updatedDb).forEach(key => {
      if (updatedDb[key].assignedEmail === emailToDelete || updatedDb[key].usedBy === emailToDelete) {
        updatedDb[key].assignedEmail = null;
        updatedDb[key].usedBy = null;
        keysModified = true;
      }
    });
    
    if (keysModified) {
      localStorage.setItem('wa_master_keys_db', JSON.stringify(updatedDb));
      setKeysList(updatedDb);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      
      {/* Admin Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage client licenses and user accounts securely.</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer border border-red-100 dark:border-red-900/40">
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button 
          onClick={() => setActiveTab('licenses')} 
          className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'licenses' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <KeyIcon className="w-4 h-4" /> License Management
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <UsersIcon className="w-4 h-4" /> User Accounts
        </button>
      </div>

      {/* ================= TAB 1: LICENSES CONTENT ================= */}
      {activeTab === 'licenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Left Column: Generate Key Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                  <UserPlus className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Generate Key</h3>
              </div>

              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">User Email ID</label>
                  <input type="email" placeholder="user@gmail.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Access Duration (Days)</label>
                  <input type="number" min="1" placeholder="e.g., 30 for 1 month" value={daysInput} onChange={(e) => setDaysInput(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 font-medium" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Message Limit</label>
                  <input type="number" min="1" placeholder="e.g., 1500" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 font-medium" />
                </div>

                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all cursor-pointer">
                  Generate License Key
                </button>
              </form>

              {generatedKeyDisplay && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-1">Generated Key:</p>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-slate-900 dark:text-white truncate">{generatedKeyDisplay}</span>
                    <button onClick={() => copyToClipboard(generatedKeyDisplay)} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-emerald-600 cursor-pointer">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Database */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4">Master Key Database</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="py-3 px-3 text-xs font-bold text-slate-400 uppercase">License Key</th>
                      <th className="py-3 px-3 text-xs font-bold text-slate-400 uppercase">Assigned Email</th>
                      <th className="py-3 px-3 text-xs font-bold text-slate-400 uppercase">Limits</th>
                      <th className="py-3 px-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="py-3 px-3 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(keysList).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-slate-400 font-bold text-sm">No license keys generated yet.</td></tr>
                    ) : (
                      Object.entries(keysList).map(([key, data]) => (
                        <tr key={key} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-mono font-bold text-xs text-slate-900 dark:text-white">{key}</td>
                          <td className="py-3 px-3 text-xs font-medium text-slate-600 dark:text-slate-300">{data.assignedEmail || 'Unassigned'}</td>
                          
                          <td className="py-3 px-3">
                            {editingKey === key ? (
                              <div className="flex items-center gap-2">
                                <input type="number" value={editDays} onChange={(e) => setEditDays(e.target.value)} className="w-14 p-1 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded font-medium outline-none" title="Days"/> 
                                <span className="text-xs text-slate-500">d</span>
                                <span className="text-xs text-slate-400">/</span>
                                <input type="number" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} className="w-16 p-1 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded font-medium outline-none" title="Messages"/>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-slate-500">{data.days} Days / {data.maxMessages} Msgs</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${data.usedBy ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                              {data.usedBy ? 'Activated' : 'Unused'}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {editingKey === key ? (
                                <>
                                  <button onClick={() => handleSaveEdit(key)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded cursor-pointer" title="Save"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingKey(null)} className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded cursor-pointer" title="Cancel"><X className="w-4 h-4" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEditClick(key, data.days, data.maxMessages)} className="p-1.5 text-slate-400 hover:text-blue-500 cursor-pointer" title="Edit Limits"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteKey(key)} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer" title="Delete Key"><Trash2 className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USERS CONTENT ================= */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4">Registered Accounts</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              View and manage users registered in the system. Deleting a user will automatically revoke any license keys assigned to them.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Full Name</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Email Address</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase">Phone Number</th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dbUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 font-bold text-sm">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    dbUsers.map((u, idx) => (
                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-4 px-4 font-bold text-sm text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="py-4 px-4 text-sm font-medium text-slate-500">{u.phone || 'N/A'}</td>
                        <td className="py-4 px-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.email)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}