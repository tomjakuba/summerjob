"use client";
import ErrorPage from "lib/components/error-page/error";
import PageHeader from "lib/components/page-header/PageHeader";
import { ExpandableRow } from "lib/components/table/ExpandableRow";
import { LoadingRow } from "lib/components/table/LoadingRow";
import { useAPIProposedJobs } from "lib/fetcher/fetcher";
import { ProposedJobComplete } from "lib/types/proposed-job";
import Link from "next/link";
import { ChangeEvent, useState } from "react";

const _columns = [
  "Název",
  "Lokalita",
  "Adresa",
  "Dny",
  "Počet pracovníků",
  "Akce",
];

export default function ProposedJobsPage() {
  const { data, error, isLoading } = useAPIProposedJobs();

  if (error) {
    return <ErrorPage error={error} />;
  }

  const ALL_AREAS = { id: "all", name: "Vše" };
  const areas = filterUniqueById(
    data?.map((job) => ({ id: job.area.id, name: job.area.name })) || []
  );
  areas.sort((a, b) => a.name.localeCompare(b.name));
  const [selectedArea, setSelectedArea] = useState(ALL_AREAS);
  const areaSelectChanged = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedArea(areas.find((a) => a.id === e.target.value) || ALL_AREAS);
  };

  const [filter, setFilter] = useState("");

  const shouldShowJob = (job: ProposedJobComplete) => {
    const area =
      selectedArea.id === ALL_AREAS.id || job.area.id === selectedArea.id;
    const name = job.name.toLowerCase().includes(filter.toLowerCase());
    return area && name;
  };

  return (
    <>
      <PageHeader title="Dostupné joby">
        <button className="btn btn-warning" type="button">
          <i className="fas fa-briefcase"></i>
          <span>Nový job</span>
        </button>
      </PageHeader>

      <section>
        <div className="container-fluid">
          <div className="row gx-3">
            <div className="col-sm-12 col-lg-9">
              <div className="table-responsive text-nowrap mb-2 smj-shadow rounded-3">
                <table className="table mb-0">
                  <thead className="smj-table-header">
                    <tr>
                      {_columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="smj-table-body mb-0">
                    {isLoading && <LoadingRow colspan={_columns.length} />}
                    {!isLoading &&
                      data !== undefined &&
                      data.map(
                        (job) =>
                          shouldShowJob(job) && (
                            <ExpandableRow
                              key={job.id}
                              data={formatJobRow(job)}
                            >
                              <>
                                <div className="ms-2">
                                  <h6>Popis</h6>
                                  <p>{job.description}</p>
                                  <p>
                                    <strong>Počet pracovníků: </strong>
                                    {job.minWorkers} - {job.maxWorkers} (
                                    {job.strongWorkers} siláků)
                                  </p>
                                  <p>
                                    <strong>
                                      Doprava do oblasti požadována:{" "}
                                    </strong>
                                    {job.area.requiresCar ? "Ano" : "Ne"}
                                  </p>
                                  <p>
                                    <strong>Naplánované dny: </strong>
                                    {job.activeJobs.length} / {job.requiredDays}
                                  </p>
                                </div>
                              </>
                            </ExpandableRow>
                          )
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-sm-12 col-lg-3">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Filtrovat</h5>
                <hr />
                <label className="form-label" htmlFor="job-name">
                  Název:
                </label>
                <input
                  type="text"
                  placeholder="např. Sekání trávy"
                  name="job-name"
                  onChange={(e) => setFilter(e.target.value)}
                  value={filter}
                />
                <label className="form-label mt-3" htmlFor="area">
                  Oblast:
                </label>
                <select
                  name="area"
                  id="area"
                  className="form-select p-1 bg-white"
                  value={selectedArea.id}
                  onChange={areaSelectChanged}
                >
                  {areas &&
                    [ALL_AREAS, ...Array.from(areas.values())].map((area) => (
                      <option value={area.id} key={area.id}>
                        {area.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function formatJobRow(job: ProposedJobComplete) {
  return [
    job.name,
    job.area.name,
    job.address,
    job.requiredDays,
    `${job.minWorkers} - ${job.maxWorkers}`,
    <Link href={`/jobs/${job.id}`}>Upravit</Link>,
  ];
}

function filterUniqueById<T extends { id: string }>(elements: T[]): T[] {
  return Array.from(new Map(elements.map((item) => [item.id, item])).values());
}
