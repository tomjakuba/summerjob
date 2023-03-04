"use client";
import { useAPICarUpdate } from "lib/fetcher/car";
import type { CarComplete, CarUpdateData } from "lib/types/car";
import { useState } from "react";
import { Modal, ModalSize } from "../modal/Modal";
import CarEditForm from "./CarEditForm";

export default function EditCar({ car }: { car: CarComplete }) {
  const [saved, setSaved] = useState(false);
  const { trigger, isMutating } = useAPICarUpdate(car.id, {
    onSuccess: () => {
      setSaved(true);
    },
  });
  const onSubmit = (data: CarUpdateData) => {
    trigger(data);
  };

  return (
    <>
      <CarEditForm
        onSubmit={onSubmit}
        car={car}
        isNewCar={false}
        isSending={isMutating}
      ></CarEditForm>
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
    </>
  );
}
