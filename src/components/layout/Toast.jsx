import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-[#263144] bg-[#131822] px-4 py-2.5 text-xs font-medium text-slate-100 shadow-xl">
      {toast.type === 'error'
        ? <AlertCircle className="w-4 h-4 text-rose-400" />
        : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      <span>{toast.message}</span>
    </div>
  );
}
