"use client";
import { useAPIProposedJobs } from "lib/fetcher/fetcher";
import ErrorPage from "../error-page/error";
import { FilterSelect, FilterSelectItem } from "../filter-select/FilterSelect";

export default function AddJobToPlanForm() {
  const { data, error, isLoading } = useAPIProposedJobs();

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

  const onJobSelected = (item: FilterSelectItem) => {
    console.log("Selected item: ", item);
  };

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <label className="form-label fw-bold" htmlFor="job-filter">
          Job:
        </label>
        <FilterSelect items={items} onSelected={onJobSelected}></FilterSelect>
        <label
          className="form-label fw-bold mt-4"
          htmlFor="private-description"
        >
          Poznámka pro organizátory:
        </label>
        <textarea
          className="form-control border p-0"
          id="private-description"
          rows={3}
        ></textarea>
        <label className="form-label fw-bold mt-4" htmlFor="public-description">
          Veřejný popis:
        </label>
        <textarea
          className="form-control border p-0"
          id="public-description"
          rows={3}
        ></textarea>
      </form>
    </>
  );
}
