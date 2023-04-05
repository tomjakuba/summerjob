"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  deserializeWorker,
  WorkerComplete,
  WorkerUpdateSchema,
} from "lib/types/worker";
import { Allergy } from "lib/prisma/client";
import { useState } from "react";
import { useAPIWorkerUpdate } from "lib/fetcher/worker";
import AllergyPill from "../forms/AllergyPill";
import { deserializeAllergies } from "lib/types/allergy";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import SuccessProceedModal from "../modal/SuccessProceedModal";
import { Serialized } from "lib/types/serialize";
import DaysSelection from "../forms/DaysSelection";
import { datesBetween, pick } from "lib/helpers/helpers";
import { useRouter } from "next/navigation";

const schema = WorkerUpdateSchema;
type WorkerForm = z.input<typeof schema>;

interface EditWorkerProps {
  serializedWorker: Serialized<WorkerComplete>;
  serializedAllergens: Serialized<Allergy>;
  eventStartDate: string;
  eventEndDate: string;
}

export default function EditWorker({
  serializedWorker,
  serializedAllergens,
  eventStartDate,
  eventEndDate,
}: EditWorkerProps) {
  const worker = deserializeWorker(serializedWorker);
  const allergies = deserializeAllergies(serializedAllergens);
  const allDates = datesBetween(
    new Date(eventStartDate),
    new Date(eventEndDate)
  );
  const {
    formState: { dirtyFields },
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      phone: worker.phone,
      allergyIds: worker.allergies.map((allergy) => allergy.id),
      availability: {
        workDays: worker.availability.workDays.map((day) => day.toJSON()),
        adorationDays: worker.availability.adorationDays.map((day) =>
          day.toJSON()
        ),
      },
    },
  });
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const { trigger, isMutating, reset, error } = useAPIWorkerUpdate(worker.id, {
    onSuccess: () => {
      setSaved(true);
      router.refresh();
    },
  });
  const onSubmit = (data: WorkerForm) => {
    const modified = pick(data, ...Object.keys(dirtyFields)) as WorkerForm;
    trigger(modified);
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>
            {worker.firstName} {worker.lastName}
          </h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="form-label fw-bold mt-4" htmlFor="name">
              Jméno
            </label>
            <input
              id="name"
              className="form-control p-0 fs-5"
              type="text"
              placeholder="Jméno"
              {...register("firstName")}
            />
            {errors.firstName?.message && (
              <p>{errors.firstName.message as string}</p>
            )}
            <label className="form-label fw-bold mt-4" htmlFor="surname">
              Příjmení
            </label>
            <input
              id="surname"
              className="form-control p-0 fs-5"
              type="text"
              placeholder="Příjmení"
              {...register("lastName")}
            />
            <label className="form-label fw-bold mt-4" htmlFor="phone">
              Telefonní číslo
            </label>
            <input
              id="phone"
              className="form-control p-0 fs-5"
              type="tel"
              maxLength={20}
              pattern="((?:\+|00)[0-9]{1,3})?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{3}"
              placeholder="(+420) 123 456 789"
              {...register("phone")}
            />
            <label className="form-label fw-bold mt-4" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              className="form-control p-0 fs-5"
              type="email"
              {...register("email")}
            />
            <label
              className="form-label d-block fw-bold mt-4"
              htmlFor="availability.workDays"
            >
              Můžu pracovat v následující dny
            </label>
            <DaysSelection
              name="availability.workDays"
              days={allDates}
              register={() => register("availability.workDays")}
            />
            <label
              className="form-label d-block fw-bold mt-4"
              htmlFor="availability.adorationDays"
            >
              Chci adorovat v následující dny
            </label>
            <DaysSelection
              name="availability.adorationDays"
              days={allDates}
              register={() => register("availability.adorationDays")}
            />
            <label
              className="form-label d-block fw-bold mt-4"
              htmlFor="allergy"
            >
              Alergie
            </label>
            <div className="form-check-inline">
              {allergies.map((allergy) => (
                <AllergyPill
                  key={allergy.id}
                  allergy={allergy}
                  register={() => register("allergyIds")}
                />
              ))}
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
            {saved && <SuccessProceedModal onClose={() => setSaved(false)} />}
            {error && <ErrorMessageModal onClose={reset} />}
          </form>
        </div>
      </div>
    </>
  );
}
