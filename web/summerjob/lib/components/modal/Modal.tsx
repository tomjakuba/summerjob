interface ModalProps {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}

export function Modal({ children, title, onClose }: ModalProps) {
  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className={`modal modal-lg fade show`}
        style={{ display: "block" }}
        tabIndex={-1}
        onAnimationEnd={() => {}}
      >
        <div className="modal-dialog">
          <div className="modal-content rounded-3">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => onClose()}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
