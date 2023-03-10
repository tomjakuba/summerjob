import { Modal, ModalSize } from "./Modal";

type ErrorMessageModalProps = {
  onClose: () => void;
};

export default function ErrorMessageModal({ onClose }: ErrorMessageModalProps) {
  return (
    <Modal title="Chyba" size={ModalSize.MEDIUM} onClose={onClose}>
      <p>
        Během ukládání nastala chyba. Zkontrolujte připojení k internetu a
        zkuste to znovu.
      </p>
      <button
        className="btn pt-2 pb-2 btn-secondary float-end"
        onClick={onClose}
      >
        Zavřít
      </button>
    </Modal>
  );
}
