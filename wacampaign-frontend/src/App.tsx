import { useState, useEffect } from 'react';
import DashboardLayout from './components/layout/DashboardLayout';
import CreateCampaign from './pages/CreateCampaign';
import Campaigns from './pages/Campaigns';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import { CampaignContext } from './context/CampaignContext';

export default function App() {
  // 1. User State
  const [user, setUser] = useState<{ name: string; email: string; phone?: string } | null>(() => {
    const savedUser = localStorage.getItem('wa_campaign_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // 2. Admin State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('wa_admin_authenticated') === 'true';
  });

  // 3. Navigation State
  const [activePage, setActivePage] = useState('Create Campaign');

  // 4. Global Campaign State (for background floating loader)
  const [campaignState, setCampaignState] = useState({
    isSending: false,
    currentContactIndex: 0,
    totalContacts: 0,
    sendResult: null as { type: 'success' | 'error', text: string } | null
  });

  // Initialize Dark Mode
  useEffect(() => {
    if (localStorage.getItem('wa_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Login Handlers
  const handleUserLogin = (userData: { name: string; email: string; phone?: string }) => {
    setUser(userData);
    localStorage.setItem('wa_campaign_user', JSON.stringify(userData));
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('wa_admin_authenticated', 'true');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('wa_campaign_user');
    localStorage.removeItem('wa_admin_authenticated');
  };

  // ==========================================
  // RENDER LOGIC
  // ==========================================

  // STATE A: If Admin is logged in, show ONLY the Admin Portal
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pt-10 px-4 sm:px-8">
        <AdminDashboard onLogout={handleLogout} />
      </div>
    );
  }

  // STATE B: If nobody is logged in, show the Auth Page
  if (!user) {
    return (
      <AuthPage 
        onLogin={handleUserLogin} 
        onAdminLogin={handleAdminLogin} 
      />
    );
  }

  // STATE C: If a regular User is logged in, show the main Software Dashboard
  return (
    <CampaignContext.Provider value={{ campaignState, setCampaignState }}>
      <DashboardLayout 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={handleLogout}
        user={user}
      >
        {/* We use display: none instead of conditional rendering so forms don't reset when switching tabs */}
        <div style={{ display: activePage === 'Create Campaign' ? 'block' : 'none' }}>
          <CreateCampaign />
        </div>
        
        <div style={{ display: activePage === 'Campaigns' ? 'block' : 'none' }}>
          <Campaigns />
        </div>
        
        <div style={{ display: activePage === 'Reports' ? 'block' : 'none' }}>
          <Reports />
        </div>
        
        <div style={{ display: activePage === 'Settings' ? 'block' : 'none' }}>
          <Settings user={user} />
        </div>
      </DashboardLayout>
    </CampaignContext.Provider>
  );
}