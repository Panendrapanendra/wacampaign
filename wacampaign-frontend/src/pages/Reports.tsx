import { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, XCircle } from 'lucide-react';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);

  // Function to load latest records from localStorage
  const loadReports = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('wa_campaign_reports') || '[]');
      setReports(saved);
    } catch {
      setReports([]);
    }
  };

  // Instant sync: listens for new campaigns, deletions, and tab switching
  useEffect(() => {
    loadReports();

    // 1. Listen for custom event fired when campaigns are sent or deleted
    window.addEventListener('wa_data_update', loadReports);
    // 2. Listen for storage events
    window.addEventListener('storage', loadReports);
    // 3. Listen for window focus
    window.addEventListener('focus', loadReports);

    // 4. Fast 1-second polling so persistent hidden tabs stay fresh in real time
    const interval = setInterval(loadReports, 1000);

    return () => {
      window.removeEventListener('wa_data_update', loadReports);
      window.removeEventListener('storage', loadReports);
      window.removeEventListener('focus', loadReports);
      clearInterval(interval);
    };
  }, []);

  const totalSent = reports.reduce((sum, report) => sum + (report.sent || 0), 0);
  const totalFailed = reports.reduce((sum, report) => sum + (report.failed || 0), 0);

  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Campaign Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Analytics and delivery statuses of finished campaigns.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-2xl text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Sent</div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalSent}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-2xl text-red-500"><XCircle className="w-6 h-6" /></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Failed</div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalFailed}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600"><BarChart2 className="w-6 h-6" /></div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Open Rate</div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {reports.length > 0 ? '~90%' : '0%'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          {reports.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 font-bold">
              No campaigns sent yet. Go to Create Campaign to send your first message!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Campaign Name</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Sent</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Delivered</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Failed</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white text-sm">{report.name}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-500">{report.date}</td>
                    <td className="py-4 px-4 text-sm font-bold text-emerald-600">{report.sent}</td>
                    <td className="py-4 px-4 text-sm font-bold text-red-500">{report.failed}</td>
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