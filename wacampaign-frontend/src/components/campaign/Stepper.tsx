import { Check } from 'lucide-react';

export default function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Upload & Extract' },
    { num: 2, label: 'Add Message & Media' },
    { num: 3, label: 'Review' },
    { num: 4, label: 'Send' },
  ];

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white dark:border-slate-800 mb-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 dark:bg-slate-800 z-0"></div>
        
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isActive = currentStep === step.num;
          
          return (
            <div key={step.num} className="relative z-10 flex items-center gap-3 bg-white dark:bg-slate-900 px-3 py-1 rounded-full">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 
                isActive ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 ring-4 ring-white dark:ring-slate-900' : 
                'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              }`}>
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
              </div>
              <span className={`text-xs font-bold hidden sm:block ${
                isActive ? 'text-slate-900 dark:text-white' : 
                isCompleted ? 'text-slate-600 dark:text-slate-300' : 
                'text-slate-400 dark:text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}