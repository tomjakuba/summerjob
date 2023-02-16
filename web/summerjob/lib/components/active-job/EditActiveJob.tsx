"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIActiveJob } from "lib/fetcher/active-job";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface EditActiveJobProps {
  job: ActiveJobNoPlan;
}

const schema = z.object({
  id: z.string(),
  publicDescription: z.string(),
  privateDescription: z.string(),
  contact: z.string(),
});
type ActiveJobForm = z.infer<typeof schema>;

export default function EditActiveJobForm({ job }: EditActiveJobProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActiveJobForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: job?.id,
      publicDescription: job?.publicDescription || "",
      privateDescription: job?.privateDescription || "",
      contact: job?.proposedJob.contact,
    },
  });
  return (
    <>
      <div className="mb-3">
        {job && (
          <>
            <div className="row">
              <div className="col">
                <h3>{job.proposedJob.name}</h3>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <form>
                  <input type="hidden" />
                  <label
                    className="form-label fw-bold mt-4"
                    htmlFor="public-description"
                  >
                    Popis
                  </label>
                  <textarea
                    className="form-control border p-1"
                    id="public-description"
                    rows={3}
                    {...register("publicDescription")}
                  ></textarea>
                  <label
                    className="form-label fw-bold mt-4"
                    htmlFor="private-description"
                  >
                    Poznámka pro organizátory
                  </label>
                  <textarea
                    className="form-control border p-1"
                    id="private-description"
                    rows={3}
                  ></textarea>
                  <label className="form-label fw-bold mt-4" htmlFor="contact">
                    Kontaktní osoba
                  </label>
                  <input
                    id="contact"
                    className="form-control p-0 fs-5"
                    type="text"
                    placeholder="Kontaktní osoba"
                  />
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
