import { useState, useEffect } from 'react';
import { 
  MessageSquare, Users, Image as ImageIcon, LayoutTemplate, 
  BarChart2, Settings, Send, Smartphone, LogOut
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (p: string) => void;
  onLogout: () => void;
  user: { name: string; email: string } | null;
}

export default function Sidebar({ activePage, setActivePage, onLogout, user }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);

  // Poll Node.js backend for WhatsApp connection status & QR code
  useEffect(() => {
    let interval: any;
    if (showProfileMenu) {
      const fetchStatus = async () => {
        try {
          const res = await fetch('http://localhost:3000/qr-status');
          const data = await res.json();
          setIsConnected(data.connected);
          setQrCodeData(data.qr);
          setConnectedPhone(data.phone);
        } catch (err) {
          console.error('Failed to fetch WhatsApp status:', err);
        }
      };

      fetchStatus();
      interval = setInterval(fetchStatus, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [showProfileMenu]);

  const handleDisconnect = async () => {
    try {
      await fetch('http://localhost:3000/disconnect', { method: 'POST' });
      setIsConnected(false);
      setConnectedPhone(null);
      setQrCodeData(null);
    } catch (err) {
      console.error('Error disconnecting:', err);
    }
  };

  const menuItems = [
    { name: 'Create Campaign', icon: Send },
    { name: 'Campaigns', icon: MessageSquare },
    { name: 'Contacts', icon: Users },
    { name: 'Media', icon: ImageIcon },
    { name: 'Templates', icon: LayoutTemplate },
    { name: 'Reports', icon: BarChart2 },
    { name: 'Settings', icon: Settings },
  ];

  const userName = user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-2xl h-screen border-r border-slate-200/60 flex flex-col justify-between fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-600/20">
            <MessageSquare className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">WaCampaign</span>
        </div>
        <nav className="px-4 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const isActive = activePage === item.name;
            const Icon = item.icon;
            return (
              <button 
                key={item.name} onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100 relative bg-white/50">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-5 mb-4 shadow-sm">
          <h4 className="font-bold text-sm text-orange-900">Pro Plan</h4>
          <p className="text-xs text-orange-700/80 mb-3 font-medium">Upgrade for more limits</p>
          <button onClick={() => setActivePage('Pricing')} className="w-full bg-white border border-orange-200 text-orange-600 py-2 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors shadow-sm cursor-pointer">
            Upgrade Now
          </button>
        </div>
        
        {/* WhatsApp QR & Status Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-full mb-3 left-4 right-4 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-5 animate-fade-in-up z-50">
            <h5 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp Status
            </h5>

            {isConnected ? (
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700">Connected</span>
                </div>
                <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 shadow-inner">
                  +{connectedPhone || '919876543210'}
                </p>
                <button onClick={handleDisconnect} className="w-full mt-3 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  Disconnect Device
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2.5 w-2.5 bg-amber-400 rounded-full"></span>
                  <span className="text-xs font-bold text-amber-600">Scan QR to Connect</span>
                </div>
                
                {/* QR Code Container */}
                <div className="bg-white p-2 border border-slate-200 rounded-xl shadow-inner mb-2 flex items-center justify-center w-36 h-36">
                  {qrCodeData ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrCodeData)}`} 
                      alt="WhatsApp QR Code" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium text-center">Generating QR Code...</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-tight">Open WhatsApp on your phone & scan</p>
              </div>
            )}

            <div className="h-px bg-slate-100 w-full mb-3"></div>

            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${showProfileMenu ? 'bg-slate-100' : 'hover:bg-slate-100/60'}`}>
          <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-md shrink-0">{userInitial}</div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-extrabold text-slate-900 leading-tight truncate">{userName}</span>
            <span className="text-xs font-medium text-slate-500 truncate">{user?.email || 'Administrator'}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}