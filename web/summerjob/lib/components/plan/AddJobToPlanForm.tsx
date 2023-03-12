"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIActiveJobCreate } from "lib/fetcher/active-job";
import { useAPIProposedJobsNotInPlan } from "lib/fetcher/proposed-job";
import {
  ActiveJobCreateData,
  ActiveJobCreateSchema,
} from "lib/types/active-job";
import { useForm } from "react-hook-form";
import ErrorPage from "../error-page/error";
import { FilterSelect, FilterSelectItem } from "../filter-select/FilterSelect";

interface AddJobToPlanFormProps {
  planId: string;
  onComplete: () => void;
}

type ActiveJobCreateFormData = Omit<ActiveJobCreateData, "planId">;
const ActiveJobCreateFormSchema = ActiveJobCreateSchema.omit({ planId: true });

export default function AddJobToPlanForm({
  planId,
  onComplete,
}: AddJobToPlanFormProps) {
  const { data, error, isLoading } = useAPIProposedJobsNotInPlan(planId);
  const { trigger, isMutating } = useAPIActiveJobCreate(planId, {
    onSuccess: () => {
      onComplete();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ActiveJobCreateFormData>({
    resolver: zodResolver(ActiveJobCreateFormSchema),
    defaultValues: {
      privateDescription: "",
      publicDescription: "",
    },
  });

  if (error && !data) {
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

  const onSubmit = (data: ActiveJobCreateFormData) => {
    trigger(data);
  };

  const onJobSelected = (item: FilterSelectItem) => {
    const job = data?.find((job) => job.id === item.id);
    if (!job) {
      return;
    }
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
        <FilterSelect
          items={items}
          onSelected={onJobSelected}
          placeholder={"Vyberte job..."}
        ></FilterSelect>
        <input type="hidden" {...register("proposedJobId")} />

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
        <button
          className="btn btn-warning mt-4 float-end"
          type="submit"
          disabled={isMutating}
        >
          Přidat
        </button>
      </form>
    </>
  );
}
