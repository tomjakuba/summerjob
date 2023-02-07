"use client";
import { useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WorkerComplete } from "lib/types/worker";
import { Allergy } from "lib/prisma/client";
import { default as t } from "lib/localization/cs-cz";
import { useState } from "react";
import { useAPIWorkerUpdate } from "lib/fetcher/worker";
import { useAPIAllergies } from "lib/fetcher/fetcher";

const schema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().min(9),
  allergyIds: z.array(z.string()),
});
type WorkerForm = z.infer<typeof schema>;

export default function EditWorker({ worker }: { worker: WorkerComplete }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkerForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: worker.id,
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email,
      phone: worker.phone,
      allergyIds: worker.allergies.map((allergy) => allergy.id),
    },
  });
  const [saved, setSaved] = useState(false);
  const { trigger, isMutating } = useAPIWorkerUpdate(worker.id, {
    onSuccess: () => {
      setSaved(true);
    },
  });
  const onSubmit = (data: WorkerForm) => {
    trigger(data);
  };

  const { data, error, isLoading } = useAPIAllergies();
  let allergies = parseAllergies(data || []);
  return (
    <>
      <div className="row">
        <div className="col">
          <h2>
            {worker.firstName} {worker.lastName}
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register("id")} />
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
            <label className="form-label d-block fw-bold mt-4" htmlFor="email">
              Alergie
            </label>
            <div className="form-check-inline">
              {isLoading && <p>Načítání alergií...</p>}
              {data &&
                allergies.map((allergy) => (
                  <AllergyPill
                    key={allergy.id}
                    allergy={allergy}
                    register={register}
                  />
                ))}
            </div>
            <label className="form-label d-block fw-bold mt-4" htmlFor="car">
              Auto
            </label>
            <input
              type="text"
              className="form-control p-0 fs-5"
              disabled={true}
              value={worker.car?.name || "Žádné"}
            />
            <input
              className="btn btn-warning m-3 ms-0 p-3"
              type="submit"
              value={isMutating ? "Ukládání..." : "Uložit"}
              disabled={isMutating}
            />
            {saved && (
              <div
                className="alert alert-success alert-dismissible d-inline-block mt-3 p-3 pe-5"
                role="alert"
              >
                Změny byly úspěšně uloženy.
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setSaved(false)}
                ></button>
              </div>
            )}
          </form>
        </div>
        <div className="w-100 d-lg-none mt-3"></div>
        <div className="col-sm-auto col-lg-3 d-flex flex-column">
          <img className="img-fluid" src="/profile.webp" />
          <button className="btn btn-warning ms-auto mt-2" type="button">
            Změnit obrázek
          </button>
        </div>
      </div>
    </>
  );
}

function AllergyPill({
  allergy,
  register,
}: {
  allergy: Allergy;
  register: UseFormRegister<WorkerForm>;
}) {
  return (
    <div className="d-inline-block me-3">
      <input
        id={allergy.id}
        className="btn-check"
        type="checkbox"
        value={allergy.id}
        {...register("allergyIds")}
      />
      <label className="form-label btn-light btn p-2" htmlFor={allergy.id}>
        {allergy.code}
      </label>
    </div>
  );
}

const parseAllergies = (allergies: Allergy[]) => {
  if (!allergies) return [];
  let result = allergies.map((allergy) => {
    return { ...allergy, code: t(allergy.code) };
  });
  result.sort((a, b) => a.code.localeCompare(b.code));
  return result;
};
