import { 
  Send, 
  FolderOpen, 
  BarChart2, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { useState, useContext } from 'react';
import { CampaignContext } from '../../context/CampaignContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  user: { name: string; email: string };
}

export default function DashboardLayout({ children, activePage, setActivePage, onLogout, user }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { campaignState } = useContext(CampaignContext);

  const menuItems = [
    { icon: Send, label: 'Create Campaign' },
    { icon: FolderOpen, label: 'Campaigns' },
    { icon: BarChart2, label: 'Reports' },
    { icon: SettingsIcon, label: 'Settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 mb-10">
        <img 
          src="/Logo.png" 
          alt="WaCampaign Logo" 
          className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-800" 
        />
        <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">WaCampaign</span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => {
          const isActive = activePage === item.label;
          return (
            <button
              key={item.label}
              onClick={() => { setActivePage(item.label); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.name}</span>
              <span className="text-[10px] font-bold text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-200 w-full overflow-hidden relative">
      <aside className="hidden lg:flex w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-6 z-20">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative">
        <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <img 
              src="/Logo.png" 
              alt="WaCampaign Logo" 
              className="w-8 h-8 rounded-lg object-cover shadow-sm border border-slate-200 dark:border-slate-800" 
            />
            <span className="font-extrabold text-lg text-slate-900 dark:text-white">WaCampaign</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 top-[73px] bg-white dark:bg-slate-900 z-30 p-6 flex flex-col h-[calc(100vh-73px)]">
            <SidebarContent />
          </div>
        )}

        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 custom-scrollbar relative z-10">
          {children}
        </main>
      </div>

      {campaignState?.isSending && (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl z-50 border border-slate-700 w-80 animate-fade-in flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            <div className="font-bold text-sm">Background Campaign Active</div>
          </div>
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Contact {campaignState.currentContactIndex} of {campaignState.totalContacts}</span>
            <span>{Math.round((campaignState.currentContactIndex / campaignState.totalContacts) * 100) || 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
              style={{ width: `${(campaignState.currentContactIndex / campaignState.totalContacts) * 100}%` }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}