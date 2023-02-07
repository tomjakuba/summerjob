"use client";
import ErrorPage from "lib/components/error-page/error";
import PageHeader from "lib/components/page-header/PageHeader";
import { JobsTable } from "lib/components/jobs/JobsTable";
import { ProposedJobComplete } from "lib/types/proposed-job";
import { useState } from "react";
import { JobsFilters } from "lib/components/jobs/JobsFilters";
import { useAPIProposedJobs } from "lib/fetcher/proposed-job";
import { filterUniqueById } from "lib/helpers/helpers";

export default function ProposedJobsPage() {
  const { data, error, isLoading } = useAPIProposedJobs();

  const areas = getAvailableAreas(data);
  const [selectedArea, setSelectedArea] = useState(areas[0]);

  const onAreaSelected = (id: string) => {
    setSelectedArea(areas.find((a) => a.id === id) || areas[0]);
  };

  const [filter, setFilter] = useState("");

  function shouldShowJob(job: ProposedJobComplete) {
    const area =
      selectedArea.id === areas[0].id || job.area.id === selectedArea.id;
    const name = job.name.toLowerCase().includes(filter.toLowerCase());
    return area && name;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

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
            <div className="col">
              <JobsFilters
                search={filter}
                onSearchChanged={setFilter}
                areas={areas}
                selectedArea={selectedArea}
                onAreaSelected={onAreaSelected}
              />
            </div>
          </div>
          <div className="row gx-3">
            <div className="col-12">
              <JobsTable
                data={data || []}
                isLoading={isLoading}
                shouldShowJob={shouldShowJob}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function getAvailableAreas(jobs?: ProposedJobComplete[]) {
  const ALL_AREAS = { id: "all", name: "Vyberte oblast" };
  const areas = filterUniqueById(
    jobs?.map((job) => ({ id: job.area.id, name: job.area.name })) || []
  );
  areas.sort((a, b) => a.name.localeCompare(b.name));
  areas.unshift(ALL_AREAS);
  return areas;
}
