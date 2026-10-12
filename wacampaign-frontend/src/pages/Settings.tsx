import { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, UserCircle, Key, ShieldCheck, AlertCircle, 
  BarChart3, Clock, CheckCircle, Copy, Check, Trash2,
  Smartphone, QrCode, LogOut, CheckCircle2, Loader2
} from 'lucide-react';

// --- WHATSAPP CONNECTION COMPONENT ---
function WhatsAppConnection() {
  const [status, setStatus] = useState<'loading' | 'disconnected' | 'qr_ready' | 'connected'>('loading');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  
  const isBooting = useRef(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(() => {
      checkStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/status');
      const data = await response.json();

      if (data.connected) {
        setStatus('connected');
        setConnectedNumber(data.number || 'Connected');
        isBooting.current = false;
      } else if (data.qr) {
        setStatus('qr_ready');
        setQrCodeData(data.qr);
        isBooting.current = false;
      } else {
        if (!isBooting.current) {
          setStatus('disconnected');
        }
      }
    } catch (error) {
      if (!isBooting.current) {
        setStatus('disconnected');
      }
    }
  };

  const generateQR = async () => {
    setStatus('loading');
    isBooting.current = true;
    setQrCodeData(null);
    
    try {
      await fetch('http://127.0.0.1:3000/generate-qr', { method: 'POST' });
      
      setTimeout(() => {
        isBooting.current = false;
      }, 15000);

    } catch (error) {
      console.error('Failed to contact backend', error);
      isBooting.current = false;
      setStatus('disconnected');
      alert('Could not reach the WhatsApp background server. Make sure your Node server is running.');
    }
  };

  const handleDisconnect = async () => {
    setStatus('loading');
    try {
      await fetch('http://127.0.0.1:3000/logout', { method: 'POST' });
      setStatus('disconnected');
      setQrCodeData(null);
      setConnectedNumber(null);
    } catch (error) {
      console.error('Failed to disconnect', error);
      setStatus('connected');
    }
  };

  const renderQrImage = () => {
    if (!qrCodeData) return null;
    if (qrCodeData.startsWith('data:image')) {
      return <img src={qrCodeData} alt="WhatsApp QR" className="w-48 h-48 rounded-xl border border-slate-200" />;
    }
    return (
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeData)}`} 
        alt="WhatsApp QR" 
        className="w-48 h-48 rounded-xl border border-slate-200" 
      />
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">WhatsApp Connection</h3>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Starting WhatsApp Engine. Please wait...</p>
        </div>
      )}

      {(status === 'disconnected' || status === 'qr_ready') && (
        <div className="flex flex-col items-center gap-4 py-2">
          {status === 'qr_ready' && qrCodeData ? (
            <div className="bg-white p-2 rounded-2xl shadow-sm">
              {renderQrImage()}
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-slate-400" />
            </div>
          )}
          
          <div className="text-center w-full">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
              {status === 'qr_ready' 
                ? 'Scan QR with WhatsApp to link device.' 
                : 'WhatsApp engine is inactive.'}
            </p>
            <button
              onClick={generateQR}
              disabled={isBooting.current}
              className={`w-full py-3 font-extrabold rounded-xl transition-colors text-sm border ${
                isBooting.current 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 cursor-pointer border-emerald-200 dark:border-emerald-800/50'
              }`}
            >
              {status === 'qr_ready' ? 'Refresh QR Code' : 'Generate QR Code'}
            </button>
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-0.5">Active Number</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{connectedNumber}</p>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-bold rounded-xl transition-colors text-sm border border-red-100 dark:border-red-900/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Disconnect WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
// --- END WHATSAPP CONNECTION COMPONENT ---


const getMasterDatabase = () => {
  const stored = localStorage.getItem('wa_master_keys_db');
  if (stored) return JSON.parse(stored);
  
  const initialDb: Record<string, { days: number; maxMessages: number; assignedEmail: string | null; usedBy: string | null }> = {
    "WAC-PRO-99F8-X2K9": { days: 30, maxMessages: 500, assignedEmail: "panendra007@gmail.com", usedBy: null },
    "WAC-BIZ-44T1-M8P3": { days: 7, maxMessages: 100, assignedEmail: "panendra007@gmail.com", usedBy: null },
    "WAC-MAX-77L2-B9Q4": { days: 90, maxMessages: 5000, assignedEmail: null, usedBy: null },
    "WAC-TST-11A0-Z1W5": { days: 3, maxMessages: 50, assignedEmail: null, usedBy: null }
  };
  localStorage.setItem('wa_master_keys_db', JSON.stringify(initialDb));
  return initialDb;
};

export default function Settings({ user }: { user: { name: string; email: string; phone?: string } }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseData, setLicenseData] = useState<{ key: string; expiry: number; maxMessages: number; usedMessages: number } | null>(null);
  const [licenseMessage, setLicenseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    const loadSettings = () => {
      const savedKey = localStorage.getItem('wa_license_key');
      const savedExpiry = localStorage.getItem('wa_license_expiry');
      const maxMsg = localStorage.getItem('wa_license_max_messages');
      const usedMsg = localStorage.getItem('wa_license_used_messages');

      if (savedKey && savedExpiry) {
        if (Date.now() < Number(savedExpiry)) {
          setLicenseData({
            key: savedKey,
            expiry: Number(savedExpiry),
            maxMessages: maxMsg ? Number(maxMsg) : 500,
            usedMessages: usedMsg ? Number(usedMsg) : 0
          });
        } else {
          localStorage.removeItem('wa_license_key');
          localStorage.removeItem('wa_license_expiry');
          localStorage.removeItem('wa_license_max_messages');
          localStorage.removeItem('wa_license_used_messages');
          setLicenseData(null);
        }
      }
    };

    loadSettings();
    window.addEventListener('wa_data_update', loadSettings);
    return () => window.removeEventListener('wa_data_update', loadSettings);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wa_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wa_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const copyEmailId = () => {
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const keyStr = licenseInput.trim().toUpperCase();
    
    if (!keyStr) {
      setLicenseMessage({ type: 'error', text: 'Please enter a license key.' });
      return;
    }

    const masterDb = getMasterDatabase();
    const keyConfig = masterDb[keyStr];

    if (!keyConfig) {
      setLicenseMessage({ type: 'error', text: 'Invalid license key! Please check the code provided by your admin.' });
      return;
    }

    if (keyConfig.assignedEmail && keyConfig.assignedEmail !== user.email) {
      setLicenseMessage({ type: 'error', text: `This license key is assigned to another email address (${keyConfig.assignedEmail})!` });
      return;
    }

    if (keyConfig.usedBy && keyConfig.usedBy !== user.email) {
      setLicenseMessage({ type: 'error', text: 'This license key has already been used by another account!' });
      return;
    }

    keyConfig.usedBy = user.email;
    keyConfig.assignedEmail = user.email;
    localStorage.setItem('wa_master_keys_db', JSON.stringify(masterDb));

    const expiryTime = Date.now() + (keyConfig.days * 24 * 60 * 60 * 1000);

    localStorage.setItem('wa_license_key', keyStr);
    localStorage.setItem('wa_license_expiry', String(expiryTime));
    localStorage.setItem('wa_license_max_messages', String(keyConfig.maxMessages));
    localStorage.setItem('wa_license_used_messages', '0');

    setLicenseData({
      key: keyStr,
      expiry: expiryTime,
      maxMessages: keyConfig.maxMessages,
      usedMessages: 0
    });
    setLicenseInput('');
    setLicenseMessage({ type: 'success', text: `License activated successfully! Granted ${keyConfig.days} days access.` });
    
    window.dispatchEvent(new Event('wa_data_update'));
  };

  const handleRemoveLicense = () => {
    localStorage.removeItem('wa_license_key');
    localStorage.removeItem('wa_license_expiry');
    localStorage.removeItem('wa_license_max_messages');
    localStorage.removeItem('wa_license_used_messages');
    setLicenseData(null);
    setLicenseMessage({ type: 'success', text: 'License key removed successfully. Software is now locked.' });
    
    window.dispatchEvent(new Event('wa_data_update'));
  };

  const formattedExpiry = licenseData ? new Date(licenseData.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="max-w-[1000px] mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your software license activation and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4">Appearance</h3>
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="text-blue-400 w-5 h-5" /> : <Sun className="text-amber-500 w-5 h-5" />}
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

          {/* NEW WHATSAPP CONNECTION COMPONENT */}
          <WhatsAppConnection />

          <div className={`p-6 rounded-3xl shadow-sm border relative overflow-hidden ${licenseData ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40'}`}>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {licenseData ? <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  <h3 className={`font-extrabold text-sm uppercase tracking-wider ${licenseData ? 'text-emerald-800 dark:text-emerald-400' : 'text-amber-800 dark:text-amber-400'}`}>
                    {licenseData ? 'License Active' : 'No License Key'}
                  </h3>
                </div>
                {licenseData && (
                  <button 
                    onClick={handleRemoveLicense} 
                    title="Remove/Deactivate License"
                    className="p-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {licenseData ? (
                <div className="space-y-3">
                  <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Active Key</p>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{licenseData.key}</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Expires: <strong>{formattedExpiry}</strong></span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/40 dark:border-emerald-800/40">
                    <div className="flex justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                      <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Messages Sent</span>
                      <span>{licenseData.usedMessages} / {licenseData.maxMessages}</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200/50 dark:bg-emerald-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (licenseData.usedMessages / licenseData.maxMessages) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Your software is locked. Send your login email ID to the admin to receive your key.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">Your Login Email ID</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-5">Send this email address to your administrator so they can generate your exclusive license key.</p>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="flex-1 font-mono font-extrabold text-slate-800 dark:text-white text-base tracking-wider">{user.email}</span>
              <button 
                onClick={copyEmailId}
                className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Email'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                <Key className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">License Activation</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Paste your unique admin authentication key below.</p>
              </div>
            </div>

            <form onSubmit={handleActivateLicense} className="space-y-4">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="e.g., WAC-PRO-99F8-X2K9" 
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  className="flex-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 font-mono transition-all uppercase"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all cursor-pointer shrink-0">
                  Activate Key
                </button>
              </div>

              {licenseMessage && (
                <div className={`text-xs font-bold p-3 rounded-xl flex items-center gap-2 ${licenseMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {licenseMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
                  {licenseMessage.text}
                </div>
              )}
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                <UserCircle className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Account Details</h3>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Profile Saved!'); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input type="email" defaultValue={user.email} disabled className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed font-medium" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-extrabold text-sm py-3 px-6 rounded-xl transition-all cursor-pointer">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}