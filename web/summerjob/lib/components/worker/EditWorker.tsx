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
import Image from "next/image";
import Link from "next/link";
import AllergyPill from "../forms/AllergyPill";
import { deserializeAllergies } from "lib/types/allergy";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import SuccessProceedModal from "../modal/SuccessProceedModal";
import { Serialized } from "lib/types/serialize";
import DaysSelection from "../forms/DaysSelection";
import { datesBetween } from "lib/helpers/helpers";

const schema = WorkerUpdateSchema.omit({ availability: true }).extend({
  availability: z.array(z.string()),
});
type WorkerForm = z.infer<typeof schema>;

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
      availability: worker.availability.days.map((day) => day.toJSON()),
    },
  });
  const [saved, setSaved] = useState(false);
  const { trigger, isMutating, reset, error } = useAPIWorkerUpdate(worker.id, {
    onSuccess: () => {
      setSaved(true);
    },
  });
  const onSubmit = (data: WorkerForm) => {
    trigger(data);
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
              type="text"
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
              htmlFor="availability"
            >
              Může pracovat v následující dny
            </label>
            <DaysSelection
              days={allDates}
              register={() => register("availability")}
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
            <label className="form-label d-block fw-bold mt-4" htmlFor="car">
              Auta
            </label>
            {worker.cars.length === 0 && <p>Žádná auta</p>}
            {worker.cars.length > 0 && (
              <div className="list-group">
                {worker.cars.map((car) => (
                  <Link
                    key={car.id}
                    href={`/cars/${car.id}`}
                    className="list-group-item list-group-item-action ps-2 d-flex align-items-center justify-content-between w-50"
                  >
                    {car.name}
                    <i className="fas fa-angle-right ms-2"></i>
                  </Link>
                ))}
              </div>
            )}

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
            {saved && (
              <SuccessProceedModal onClose={() => window.history.back()} />
            )}
            {error && <ErrorMessageModal onClose={reset} />}
          </form>
        </div>
        <div className="w-100 d-lg-none mt-3"></div>
        <div className="col-sm-auto col-lg-3 d-flex flex-column">
          <div>
            <Image
              className="position-relative"
              src="/profile.webp"
              alt="Worker photo"
              fill={true}
              quality={95}
            />
          </div>

          <button className="btn btn-warning ms-auto mt-2" type="button">
            Změnit obrázek
          </button>
        </div>
      </div>
    </>
  );
}
