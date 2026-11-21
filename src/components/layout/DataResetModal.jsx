import { AlertCircle, X } from 'lucide-react';

export function DataResetModal({
  open,
  confirmFullWipe,
  setConfirmFullWipe,
  close,
  handleClearItems,
  handleLoadSamples,
  handleFullWipe,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#263144] bg-[#131822] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Manage Local Ledger Data</h3>
          <button type="button" onClick={close} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Your data is stored locally in this browser. Export a JSON backup first if you want to keep your current entries.
        </p>
        {!confirmFullWipe ? (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => { handleClearItems(); close(); }} className="w-full rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/25">
              Flush Items List Only (Keep Resets & Default Tags)
            </button>
            <button type="button" onClick={() => { handleLoadSamples(); close(); }} className="w-full rounded-lg border border-[#d4af37]/40 bg-[#d4af37]/15 px-3 py-2 text-xs font-semibold text-[#f5c451] hover:bg-[#d4af37]/25">
              Load Sample Items (Replaces Current Items)
            </button>
            <button type="button" onClick={() => setConfirmFullWipe(true)} className="w-full rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/25">
              Complete Fresh Wipe (New User Experience)...
            </button>
            <button type="button" onClick={close} className="w-full rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white">
              Cancel
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-3">
            <div className="flex items-start gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold">Confirm Complete Fresh Wipe</p>
                <p className="text-rose-200/80">This will erase all items, custom daily/weekly reset tasks, hidden task settings, and custom default tags back to a clean new-user state.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { handleFullWipe(); close(); }} className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600">
                Yes, Wipe Everything
              </button>
              <button type="button" onClick={() => setConfirmFullWipe(false)} className="rounded-lg border border-[#263144] bg-[#0b0e14] px-3 py-2 text-xs font-medium text-slate-300 hover:text-white">
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
