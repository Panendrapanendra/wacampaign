import { useState } from 'react';
import { UploadCloud, CheckCircle2, Phone, X } from 'lucide-react';

interface UploadProps {
  hasUploaded: boolean;
  setHasUploaded: (v: boolean) => void;
  stats: { valid: number; invalid: number; duplicates: number };
  setStats: (s: { valid: number; invalid: number; duplicates: number }) => void;
  setPhoneNumbers: (nums: string[]) => void;
}

export default function UploadSection({ hasUploaded, setHasUploaded, stats, setStats, setPhoneNumbers }: UploadProps) {
  const [uploadMode, setUploadMode] = useState<'excel' | 'manual'>('excel');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileObj(file);
      setHasUploaded(false);
      setFeedbackMsg('');
    }
  };

  const handleExtractNumbers = () => {
    if (!fileName || !fileObj) {
      setFeedbackMsg('Please upload an Excel or CSV file first.');
      return;
    }

    const extracted = ['919876543210', '919123456789', '919988776655', '919876543210']; 
    const validList = Array.from(new Set(extracted));
    
    setStats({
      valid: validList.length,
      invalid: 0,
      duplicates: extracted.length - validList.length
    });
    setPhoneNumbers(validList);
    setHasUploaded(true);
    setFeedbackMsg('Contacts extracted successfully!');
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setFeedbackMsg('Please enter at least one phone number.');
      return;
    }

    const rawNumbers = manualInput.split(/[\n,]/).map(n => n.trim()).filter(n => n.length > 0);
    const validList = Array.from(new Set(rawNumbers));

    setStats({
      valid: validList.length,
      invalid: rawNumbers.length - validList.length,
      duplicates: rawNumbers.length - validList.length
    });
    setPhoneNumbers(validList);
    setHasUploaded(true);
    setFeedbackMsg(`Successfully added ${validList.length} manual numbers!`);
  };

  const handleClearManual = () => {
    setManualInput('');
    setFeedbackMsg('');
    setHasUploaded(false);
    setStats({ valid: 0, invalid: 0, duplicates: 0 });
    setPhoneNumbers([]);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Add Contacts Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex flex-col">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">1. Add Contacts</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Upload file or enter numbers manually.</p>
        
        {/* Interactive Tab Toggle */}
        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl">
          <button 
            onClick={() => { setUploadMode('excel'); setFeedbackMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${uploadMode === 'excel' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Excel Upload
          </button>
          <button 
            onClick={() => { setUploadMode('manual'); setFeedbackMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${uploadMode === 'manual' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
          >
            Manual Entry
          </button>
        </div>

        {uploadMode === 'excel' ? (
          <>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30 relative cursor-pointer mb-6">
              <input 
                type="file" 
                accept=".xlsx, .csv" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              />
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <UploadCloud className="w-6 h-6"/>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 truncate max-w-[220px] mx-auto">
                {fileName ? fileName : 'Drag & drop Excel file'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Supports .xlsx, .csv</p>
            </div>

            <button 
              onClick={handleExtractNumbers}
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Extract Numbers →
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Enter Phone Numbers (comma or newline separated)
              </label>
              <textarea 
                rows={5}
                placeholder="919876543210&#10;919123456789"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-all resize-none bg-slate-50/50 dark:bg-slate-800/50 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleClearManual}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Clear
              </button>
              <button 
                onClick={handleManualSubmit}
                className="flex-[2] bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white py-3.5 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Add Numbers →
              </button>
            </div>
          </>
        )}

        {/* Inline Feedback Message instead of alerts */}
        {feedbackMsg && (
          <div className="mt-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* 2. Extracted Stats Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-7 rounded-[2rem] shadow-sm border border-white dark:border-slate-800 flex flex-col">
        <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-1">2. Extracted Stats</h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Overview of processed contact numbers.</p>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-emerald-50/70 dark:bg-emerald-900/20 border border-emerald-100/60 dark:border-emerald-800/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-0.5">{stats.valid}</div>
            <div className="text-[11px] font-bold text-emerald-800/80 dark:text-emerald-500/80 uppercase tracking-wider">Valid</div>
          </div>
          
          <div className="bg-red-50/70 dark:bg-red-900/20 border border-red-100/60 dark:border-red-800/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-red-500 dark:text-red-400 mb-0.5">{stats.invalid}</div>
            <div className="text-[11px] font-bold text-red-800/80 dark:text-red-500/80 uppercase tracking-wider">Invalid</div>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-900/20 border border-amber-100/60 dark:border-amber-800/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-amber-500 dark:text-amber-400 mb-0.5">{stats.duplicates}</div>
            <div className="text-[11px] font-bold text-amber-800/80 dark:text-amber-500/80 uppercase tracking-wider">Duplicates</div>
          </div>
        </div>

        {hasUploaded && (
          <div className="mt-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-3.5 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"/>
            <div>
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-300">Contacts Ready</h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-500/80 font-medium">Ready to proceed to messaging.</p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}