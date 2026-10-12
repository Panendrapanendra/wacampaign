import { useState, useEffect } from 'react';
import { FolderOpen, Trash2 } from 'lucide-react';

export default function Campaigns() {
  const [savedCampaigns, setSavedCampaigns] = useState<any[]>([]);

  // Function to load latest records from localStorage
  const loadCampaigns = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('wa_campaign_reports') || '[]');
      setSavedCampaigns(saved);
    } catch {
      setSavedCampaigns([]);
    }
  };

  // Instant sync: listens for new campaigns, window focus, and tab switching
  useEffect(() => {
    loadCampaigns();

    // 1. Listen for custom event fired when a campaign finishes
    window.addEventListener('wa_data_update', loadCampaigns);
    // 2. Listen for storage changes across tabs
    window.addEventListener('storage', loadCampaigns);
    // 3. Listen for window focus when switching back to this window
    window.addEventListener('focus', loadCampaigns);

    // 4. Fast 1-second polling so persistent hidden tabs stay fresh in real time
    const interval = setInterval(loadCampaigns, 1000);

    return () => {
      window.removeEventListener('wa_data_update', loadCampaigns);
      window.removeEventListener('storage', loadCampaigns);
      window.removeEventListener('focus', loadCampaigns);
      clearInterval(interval);
    };
  }, []);

  const handleDelete = (id: number) => {
    const updated = savedCampaigns.filter(c => c.id !== id);
    setSavedCampaigns(updated);
    localStorage.setItem('wa_campaign_reports', JSON.stringify(updated));

    // Immediately notify Reports tab so metrics update instantly
    window.dispatchEvent(new Event('wa_data_update'));
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Campaign History</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Review your previously sent campaigns.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          {savedCampaigns.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 font-bold">
              You haven't sent any campaigns yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Campaign Name</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Created</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Media Type</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedCampaigns.map((camp) => (
                  <tr key={camp.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{camp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-500">{camp.date}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-500">{camp.type}</td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-bold">{camp.status}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(camp.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete campaign record"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
}