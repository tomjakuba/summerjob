"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAPIActiveJobCreate,
  useAPIProposedJobsNotInPlan,
} from "lib/fetcher/fetcher";
import { ProposedJobComplete } from "lib/types/proposed-job";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ErrorPage from "../error-page/error";
import { FilterSelect, FilterSelectItem } from "../filter-select/FilterSelect";

interface AddJobToPlanFormProps {
  planId: string;
  onComplete: () => void;
}

const schema = z.object({
  proposedJobId: z.string(),
  privateDescription: z.string(),
  publicDescription: z.string(),
  planId: z.string(),
});
type AddJobToPlanFormData = z.infer<typeof schema>;

export default function AddJobToPlanForm({
  planId,
  onComplete,
}: AddJobToPlanFormProps) {
  const { data, error, isLoading } = useAPIProposedJobsNotInPlan(planId);
  const [selectedJob, setSelectedJob] = useState<ProposedJobComplete>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddJobToPlanFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      privateDescription: "",
      publicDescription: "",
      planId: planId,
    },
  });

  if (error) {
    return <ErrorPage error={error} />;
  }

  let items: FilterSelectItem[] =
    data?.map((job) => ({
      id: job.id,
      name: job.name,
      searchable: job.name,
      item: (
        <span>
          {job.name} ({job.area.name})
        </span>
      ),
    })) || [];

  const { trigger, isMutating } = useAPIActiveJobCreate({
    onSuccess: () => {
      onComplete();
    },
  });
  const onSubmit = (data: AddJobToPlanFormData) => {
    trigger(data);
  };

  const onJobSelected = (item: FilterSelectItem) => {
    const job = data?.find((job) => job.id === item.id);
    if (!job) {
      return;
    }
    setSelectedJob(job);
    setValue("proposedJobId", job.id);
    if (job.description) {
      setValue("publicDescription", job.description);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="form-label fw-bold" htmlFor="job-filter">
          Job:
        </label>
        <FilterSelect items={items} onSelected={onJobSelected}></FilterSelect>
        <input type="hidden" {...register("proposedJobId")} />
        <input type="hidden" {...register("planId")} />

        <label className="form-label fw-bold mt-4" htmlFor="public-description">
          Veřejný popis:
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
          Poznámka pro organizátory:
        </label>
        <textarea
          className="form-control border p-1"
          id="private-description"
          rows={3}
          {...register("privateDescription")}
        ></textarea>
        <button className="btn btn-warning mt-4 float-end" type="submit">
          Přidat
        </button>
      </form>
    </>
  );
}
