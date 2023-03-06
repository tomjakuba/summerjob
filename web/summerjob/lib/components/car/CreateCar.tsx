"use client";
import { useAPICarCreate } from "lib/fetcher/car";
import type { CarCreateData } from "lib/types/car";
import { WorkerBasicInfo } from "lib/types/worker";
import { useState } from "react";
import { Modal, ModalSize } from "../modal/Modal";
import CarCreateForm from "./CarCreateForm";

export default function CreateCar({ workers }: { workers: WorkerBasicInfo[] }) {
  const [saved, setSaved] = useState(false);
  const { trigger, isMutating, error, reset } = useAPICarCreate({
    onSuccess: () => {
      setSaved(true);
    },
  });
  const onSubmit = (data: CarCreateData) => {
    trigger(data);
  };

  return (
    <>
      <CarCreateForm
        onSubmit={onSubmit}
        isSending={isMutating}
        owners={workers}
      />
      {saved && (
        <Modal
          title="Úspěch"
          size={ModalSize.MEDIUM}
          onClose={() => setSaved(false)}
        >
          <p>Změny byly úspěšně uloženy.</p>
          <button
            className="btn pt-2 pb-2 btn-warning float-end"
            onClick={() => window.history.back()}
          >
            Pokračovat
          </button>
        </Modal>
      )}
      {error && (
        <Modal
          title="Chyba"
          size={ModalSize.MEDIUM}
          onClose={() => setSaved(false)}
        >
          <p>
            Během ukládání nastala chyba. Zkontrolujte připojení k internetu a
            zkuste to znovu.
          </p>
          <button
            className="btn pt-2 pb-2 btn-secondary float-end"
            onClick={reset}
          >
            Zavřít
          </button>
        </Modal>
      )}
    </>
  );
}
