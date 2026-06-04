export default function Modal({ title, children, onClose, onConfirm, confirmLabel = 'Confirmer' }) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h3>{title}</h3>
        {children}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          {onConfirm && (
            <button type="button" className="btn btn-primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
