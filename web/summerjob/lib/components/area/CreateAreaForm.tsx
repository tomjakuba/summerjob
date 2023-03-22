"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIAreaCreate } from "lib/fetcher/area";
import { AreaCreateData, AreaCreateSchema } from "lib/types/area";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import SuccessProceedModal from "../modal/SuccessProceedModal";

interface CreateAreaProps {
  eventId: string;
}

export default function CreateAreaForm({ eventId }: CreateAreaProps) {
  const { trigger, error, isMutating, reset } = useAPIAreaCreate(eventId);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AreaCreateData>({
    resolver: zodResolver(AreaCreateSchema),
    defaultValues: {
      summerJobEventId: eventId,
    },
  });

  const onSubmit = (data: AreaCreateData) => {
    trigger(data, {
      onSuccess: () => {
        setSaved(true);
      },
    });
  };

  const router = useRouter();
  const onSuccessMessageClose = () => {
    router.back();
    router.refresh();
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Přidat oblast</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <input type="hidden" {...register("summerJobEventId")} />
            <label className="form-label fw-bold mt-4" htmlFor="name">
              Název oblasti
            </label>
            <input
              className="form-control p-1 ps-2"
              id="name"
              {...register("name")}
            />
            {errors.name && (
              <div className="text-danger">Zadejte název oblasti</div>
            )}

            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="requiresCar"
                {...register("requiresCar")}
              />
              <label className="form-check-label" htmlFor="requiresCar">
                <i className="fa fa-car ms-2 me-2"></i>
                Do oblasti je nutné dojet autem
              </label>
            </div>

            <div className="d-flex justify-content-between gap-3">
              <button
                className="btn btn-secondary mt-4"
                type="button"
                onClick={() => window.history.back()}
              >
                Zpět
              </button>
              <input
                type={"submit"}
                className="btn btn-warning mt-4"
                value={"Uložit"}
                disabled={isMutating}
              />
            </div>
          </form>
        </div>
      </div>
      {saved && <SuccessProceedModal onClose={onSuccessMessageClose} />}
      {error && <ErrorMessageModal onClose={reset} />}
    </>
  );
}
