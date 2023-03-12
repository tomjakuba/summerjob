import { Modal, ModalSize } from "./Modal";
type ConfirmationModalProps = {
  onConfirm: () => void;
  onReject: () => void;
  children: React.ReactNode;
};

export default function ConfirmationModal({
  onConfirm,
  onReject,
  children,
}: ConfirmationModalProps) {
  return (
    <Modal title="Potvrdit akci" size={ModalSize.MEDIUM} onClose={onReject}>
      {children}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-secondary pt-2 pb-2"
          type="button"
          onClick={() => onReject()}
        >
          Zpět
        </button>
        <button
          className="btn pt-2 pb-2 btn-warning"
          onClick={() => onConfirm()}
        >
          Potvrdit
        </button>
      </div>
    </Modal>
  );
}
