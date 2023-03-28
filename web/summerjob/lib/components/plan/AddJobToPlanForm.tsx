"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIActiveJobCreate } from "lib/fetcher/active-job";
import { useAPIProposedJobsNotInPlan } from "lib/fetcher/proposed-job";
import {
  ActiveJobCreateData,
  ActiveJobCreateSchema,
} from "lib/types/active-job";
import { ProposedJobComplete } from "lib/types/proposed-job";
import { useMemo } from "react";
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
    clearErrors,
  } = useForm<ActiveJobCreateFormData>({
    resolver: zodResolver(ActiveJobCreateFormSchema),
    defaultValues: {
      privateDescription: "",
      publicDescription: "",
    },
  });

  const items = useMemo(() => {
    if (!data) {
      return [];
    }
    const sorted = new Array(...data);
    sorted.sort((a, b) => {
      if (a.pinned && !b.pinned) {
        return -1;
      }
      if (!a.pinned && b.pinned) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });

    return sorted.map((job) => ({
      id: job.id,
      name: job.name,
      searchable: job.name,
      item: <AddJobSelectItem job={job} />,
    }));
  }, [data]);

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
    clearErrors("proposedJobId");
  };

  if (error && !data) {
    return <ErrorPage error={error} />;
  }

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
        {errors.proposedJobId && (
          <div className="text-danger">Vyberte job!</div>
        )}

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

function AddJobSelectItem({ job }: { job: ProposedJobComplete }) {
  return (
    <>
      <div className="text-wrap">
        {job.name} ({job.area.name})
        {job.pinned && (
          <i className="ms-2 fas fa-thumbtack smj-action-pinned" />
        )}
      </div>
      <div className="text-muted text-wrap text-small">
        Naplánováno: {job.activeJobs.length}/{job.requiredDays}
      </div>
    </>
  );
}
