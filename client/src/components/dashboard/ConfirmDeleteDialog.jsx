import Modal from "../ui/Modal";

/** Confirmation dialog for destructive actions. */
const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, loading, serviceName, provider }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete subscription">
      <div className="space-y-3">
        <p className="text-foreground text-[15px]">
          Are you sure you want to delete <strong>{serviceName}</strong>
          {provider ? <> from <span className="capitalize">{provider}</span></> : null}?
        </p>
        <p className="text-sm text-muted">
          This permanently removes the subscription from your tracking. Past
          transactions are kept. This action cannot be undone.
        </p>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 min-h-[44px] bg-surface-2 hover:bg-border text-foreground rounded-xl font-medium text-sm transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 min-h-[44px] bg-danger hover:opacity-90 text-white rounded-xl font-medium text-sm transition-opacity duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete subscription"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteDialog;
