import { Gift, Zap, Crown, CheckCircle2, MinusCircle, ArrowRight, Check } from 'lucide-react';

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto pb-16 relative">
      
      {/* Header Section */}
      <div className="text-center mb-16 relative z-10 pt-4">
        <span className="text-emerald-600 font-bold text-[10px] tracking-[0.2em] uppercase bg-emerald-100/80 px-4 py-1.5 rounded-full shadow-sm">
          Simple • Powerful • Affordable
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-6 mb-4 tracking-tight">
          Choose Your Plan
        </h2>
        <p className="text-slate-500 font-medium text-lg">
          Start free. Upgrade when your campaigns grow.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
        
        {/* --- FREE PLAN --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex gap-4 items-start mb-6">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-500"><Gift className="w-8 h-8" /></div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Free</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Perfect for trying WaCampaign</p>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">₹0</span>
            <p className="text-sm font-medium text-slate-400 mt-1">Forever</p>
          </div>
          
          <div className="flex bg-emerald-50/50 rounded-2xl p-4 mb-8 border border-emerald-100/50">
            <div className="flex-1 text-center border-r border-emerald-100">
              <div className="text-xl font-black text-emerald-700">1</div>
              <div className="text-[10px] font-semibold text-emerald-600/80 mt-1 leading-tight">Campaign<br/>per day</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xl font-black text-emerald-700">50</div>
              <div className="text-[10px] font-semibold text-emerald-600/80 mt-1 leading-tight">Phone numbers<br/>per campaign</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <FeatureItem text="Excel upload" included={true} />
            <FeatureItem text="Number extraction" included={true} />
            <FeatureItem text="Remove duplicates" included={true} />
            <FeatureItem text="Images, videos & documents" included={true} />
            <FeatureItem text="Instagram / YouTube & other links" included={true} />
            <FeatureItem text="Message personalization (e.g. {{name}})" included={true} />
            <FeatureItem text="Campaign scheduling" included={false} />
            <FeatureItem text="Advanced reports" included={false} />
          </div>
          <button className="w-full py-3.5 rounded-xl text-emerald-600 font-extrabold text-sm border-2 border-emerald-100 hover:bg-emerald-50 transition-colors">
            Start Free
          </button>
        </div>

        {/* --- PLUS PLAN (MOST POPULAR) --- */}
        <div className="bg-white rounded-[2rem] p-8 shadow-2xl border-2 border-emerald-500 relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-b-xl flex items-center gap-1">
            <Crown className="w-3 h-3" /> Most Popular
          </div>
          <div className="flex gap-4 items-start mb-6 mt-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Zap className="w-8 h-8 fill-emerald-600" /></div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Plus</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 leading-tight">For small businesses & regular<br/>campaigns</p>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">₹49</span>
            <p className="text-sm font-medium text-slate-400 mt-1">7 Days</p>
          </div>
          
          <div className="flex bg-emerald-50 rounded-2xl p-4 mb-8 border border-emerald-100">
            <div className="flex-1 text-center border-r border-emerald-200/60">
              <div className="text-xl font-black text-emerald-700">5</div>
              <div className="text-[10px] font-semibold text-emerald-600/80 mt-1 leading-tight">Campaigns<br/>per day</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-xl font-black text-emerald-700">100</div>
              <div className="text-[10px] font-semibold text-emerald-600/80 mt-1 leading-tight">Phone numbers<br/>per campaign</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <FeatureItem text="Excel upload" included={true} />
            <FeatureItem text="Number extraction" included={true} />
            <FeatureItem text="Remove duplicates" included={true} />
            <FeatureItem text="Images, videos & documents" included={true} />
            <FeatureItem text="Instagram / YouTube & other links" included={true} />
            <FeatureItem text="Message personalization (e.g. {{name}})" included={true} />
            <FeatureItem text="Campaign scheduling" included={true} />
            <FeatureItem text="Basic reports" included={true} />
          </div>
          <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all flex justify-center items-center gap-2">
            Get Plus <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* --- PRO PLAN --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex gap-4 items-start mb-6">
            <div className="bg-amber-50 p-3 rounded-2xl text-amber-500"><Crown className="w-8 h-8 fill-amber-500" /></div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">Pro</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">For high-volume campaign users</p>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-black text-slate-900">₹99</span>
            <p className="text-sm font-medium text-slate-400 mt-1">30 Days</p>
          </div>
          
          <div className="flex bg-amber-50/50 rounded-2xl p-4 mb-8 border border-amber-100/50">
            <div className="flex-1 text-center border-r border-amber-100">
              <div className="text-[15px] font-black text-amber-700 mt-1">Unlimited</div>
              <div className="text-[10px] font-semibold text-amber-600/80 mt-1 leading-tight">Campaigns<br/>per day</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-[15px] font-black text-amber-700 mt-1">Unlimited</div>
              <div className="text-[10px] font-semibold text-amber-600/80 mt-1 leading-tight">Phone numbers<br/>per campaign</div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <FeatureItem text="Excel upload" included={true} />
            <FeatureItem text="Number extraction" included={true} />
            <FeatureItem text="Remove duplicates" included={true} />
            <FeatureItem text="Images, videos & documents" included={true} />
            <FeatureItem text="Instagram / YouTube & other links" included={true} />
            <FeatureItem text="Message personalization (e.g. {{name}})" included={true} />
            <FeatureItem text="Campaign scheduling" included={true} />
            <FeatureItem text="Advanced reports" included={true} />
            <FeatureItem text="Priority support" included={true} />
          </div>
          <button className="w-full py-3.5 rounded-xl text-amber-600 font-extrabold text-sm border-2 border-amber-200 hover:bg-amber-50 transition-colors flex justify-center items-center gap-2">
            Go Pro <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
      
      {/* Bottom Disclaimer */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 bg-white/60 backdrop-blur-sm border border-slate-200 py-3 px-6 rounded-full w-max mx-auto shadow-sm">
         <div className="bg-emerald-500 rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>
         <span className="text-slate-800">All plans include</span> Excel upload, phone-number extraction, duplicate removal, personalized messages, media, and social links.
      </div>
    </div>
  );
}

// Helper component for the feature lists
function FeatureItem({ text, included }: { text: string, included: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {included ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : (
        <MinusCircle className="w-5 h-5 text-slate-200 shrink-0" />
      )}
      <span className={`text-[13px] font-medium leading-tight ${included ? 'text-slate-700' : 'text-slate-400'}`}>
        {text}
      </span>
    </div>
  );
}