import { Modal } from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  function handleClose() {
    if (!isLoading) onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={(
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 ${tone === 'danger' ? 'bg-[var(--status-danger)] hover:brightness-90' : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'}`}
          >
            {isLoading ? (
              <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : null}
            {isLoading ? 'Working...' : confirmLabel}
          </button>
        </>
      )}
    >
      <p className="text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
    </Modal>
  );
}
