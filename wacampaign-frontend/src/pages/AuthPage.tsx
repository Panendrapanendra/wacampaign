import { useState } from 'react';
import { 
  MessageSquare, Send, Users, BarChart2, Mail, 
  Lock, User, Phone, Eye, EyeOff, ArrowRight, Check 
} from 'lucide-react';

interface AuthPageProps {
  onLogin: (userData: { name: string; email: string; phone?: string }) => void;
  onAdminLogin: () => void;
}

export default function AuthPage({ onLogin, onAdminLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const endpoint = isLogin 
      ? 'http://127.0.0.1:3000/api/login/' 
      : 'http://127.0.0.1:3000/api/register/';
    const payload = isLogin ? { email, password } : { name, email, phone, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin({ 
          name: data.name || (isLogin ? 'User' : name), 
          email: data.email || email, 
          phone: data.phone || phone 
        });
      } else {
        setError(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Could not connect to backend server. Make sure the Node.js backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '6379618182Panendr') {
      onAdminLogin();
    } else {
      setError('Invalid admin password.');
    }
  };

  const loginFeatures = [
    { title: 'Bulk Messaging', desc: 'Reach thousands in seconds', icon: Send },
    { title: 'Manage Contacts', desc: 'Upload & organize easily', icon: Users },
    { title: 'Track Results', desc: 'See real-time reports', icon: BarChart2 },
  ];

  const signupFeatures = [
    { title: 'Start Campaigns', desc: 'Send messages in bulk', icon: Send },
    { title: 'Manage Contacts', desc: 'Upload and organize numbers', icon: Users },
    { title: 'Add Media & Links', desc: 'Images, videos, documents, social links', icon: MessageSquare },
    { title: 'Track Performance', desc: 'View real-time reports', icon: BarChart2 },
  ];

  const features = isLogin ? loginFeatures : signupFeatures;

  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-b from-emerald-50 to-emerald-100/50 flex-col justify-between p-12 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <MessageSquare className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900 leading-tight block">WaCampaign</span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase">Send. Connect. Grow.</span>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 max-w-sm leading-[1.1]">
            {isAdminMode 
              ? 'Master Administrator Access' 
              : (isLogin ? 'Grow Your Business with WhatsApp' : 'Create Your Account')}
          </h1>
          <p className="text-slate-600 font-medium mb-10 max-w-sm">
            {isAdminMode 
              ? 'Secure portal for generating and managing client license keys.' 
              : (isLogin ? 'Send personalized messages, share media, and reach more people easily.' : 'Start your WhatsApp campaign journey today. It\'s quick and easy.')}
          </p>

          {!isAdminMode && (
            <div className="space-y-6">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-emerald-100/80 p-3 rounded-2xl text-emerald-600">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-[400px]">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            {isAdminMode ? 'Admin Portal' : (isLogin ? 'Welcome Back' : 'Create Account')}
          </h2>
          <p className="text-slate-500 font-medium mb-6 text-sm">
            {isAdminMode 
              ? 'Enter master password to access the generator.' 
              : (isLogin ? 'Log in to your WaCampaign account' : 'Get started with WaCampaign in seconds.')}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          {!isAdminMode ? (
            // ================= USER LOGIN / SIGNUP FORM =================
            <>
              <form className="space-y-4" onSubmit={handleUserSubmit}>
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Enter your full name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                        required 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                      required 
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                        required 
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder={isLogin ? "Enter your password" : "Create a password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Confirm your password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" 
                        required 
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                      {isLogin ? 'Remember me' : 'I agree to the Terms & Privacy'}
                    </span>
                  </label>
                  {isLogin && <a href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</a>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Create Account')} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-8 text-center text-sm font-medium text-slate-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                  className="font-extrabold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </div>
            </>
          ) : (
            // ================= ADMIN LOGIN FORM =================
            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Master Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter admin password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-slate-500/10 focus:border-slate-800 outline-none transition-all" 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <Lock className="w-4 h-4" /> Access Admin Portal
              </button>
            </form>
          )}

          {/* SECRET ADMIN TOGGLE */}
          <div className="mt-8 text-center relative z-10 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => { setIsAdminMode(!isAdminMode); setError(''); setAdminPassword(''); }} 
              className="text-[11px] font-bold text-slate-400 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              {isAdminMode ? <><User className="w-3.5 h-3.5" /> Back to User Login</> : <><Lock className="w-3.5 h-3.5" /> Admin Access</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}