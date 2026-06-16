function Modal({ isOpen, title, children, onClose, contentClassName = '' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className={`modal-content ${contentClassName}`.trim()} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} type="button">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
