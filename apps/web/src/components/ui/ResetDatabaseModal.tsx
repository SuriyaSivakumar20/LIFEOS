import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ResetDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<void>;
}

export const ResetDatabaseModal: React.FC<ResetDatabaseModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [step, setStep] = useState<'warn' | 'confirm'>('warn');
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isResetting) return;
    setStep('warn');
    setConfirmText('');
    setErrorMessage(null);
    onClose();
  };

  const handleProceedToConfirm = () => {
    setStep('confirm');
    setConfirmText('');
    setErrorMessage(null);
  };

  const handleExecuteReset = async () => {
    if (confirmText.trim() !== 'RESET' || isResetting) return;

    setIsResetting(true);
    setErrorMessage(null);
    try {
      await onConfirmReset();
      handleClose();
    } catch (err) {
      console.error('Reset database failed:', err);
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-bg-elevated border border-status-error/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-content-primary">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-error/20 text-status-error flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                {step === 'warn' ? 'Reset Local Database' : 'Final Confirmation Required'}
              </h2>
              <p className="text-xs text-status-error font-medium">
                Irreversible Permanent Data Deletion
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isResetting}
            className="text-content-muted hover:text-content-primary transition-colors p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Warning & Data Audit */}
        {step === 'warn' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-status-error/10 border border-status-error/20 text-xs text-content-secondary leading-relaxed space-y-2">
              <p className="font-semibold text-status-error">
                Warning: This action will completely purge your local IndexedDB storage.
              </p>
              <p>
                The following locally stored information will be permanently erased and cannot be recovered:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-content-primary pt-1">
                <li>Financial transactions, accounts, & balances</li>
                <li>Planner tasks & scheduled reminders</li>
                <li>Habit trackers, streaks, & completion logs</li>
                <li>Personal journal entries & reflections</li>
                <li>User profile & theme/security settings</li>
                <li>Alfred offline chat messages & session history</li>
              </ul>
            </div>

            <p className="text-xs text-content-muted">
              If you wish to preserve your data, cancel now. In Sprint 5, an export backup feature will allow saving offline snapshots prior to resetting.
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-boundary">
              {/* Safe Default: Cancel */}
              <Button
                variant="primary"
                onClick={handleClose}
                className="w-full sm:w-auto justify-center"
              >
                Cancel (Keep My Data)
              </Button>
              <Button
                variant="danger"
                onClick={handleProceedToConfirm}
                className="w-full sm:w-auto justify-center"
              >
                Proceed to Confirmation...
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Explicit Second Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-xs text-content-secondary leading-relaxed">
              To verify that you want to permanently delete all local data without recovery, type{' '}
              <strong className="text-status-error font-mono font-bold">RESET</strong> in the field below:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type RESET"
              disabled={isResetting}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-secondary border border-status-error/50 text-content-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-status-error/40"
            />

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-status-error/20 border border-status-error/40 text-xs text-status-error font-mono">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-boundary">
              {/* Safe Default: Cancel */}
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isResetting}
                className="w-full sm:w-auto justify-center"
              >
                Cancel (Safe)
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                disabled={confirmText.trim() !== 'RESET' || isResetting}
                onClick={handleExecuteReset}
                className="w-full sm:w-auto justify-center"
              >
                {isResetting ? 'Deleting Database...' : 'Permanently Delete All Data'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
