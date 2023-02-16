"use client";
import ErrorPage from "lib/components/error-page/error";
import AddJobToPlanForm from "lib/components/plan/AddJobToPlanForm";
import { Modal } from "lib/components/modal/Modal";
import PageHeader from "lib/components/page-header/PageHeader";
import { PlanFilters } from "lib/components/plan/PlanFilters";
import { PlanTable } from "lib/components/plan/PlanTable";
import { useAPIPlan } from "lib/fetcher/plan";
import { useAPIWorkersWithoutJob } from "lib/fetcher/worker";
import { filterUniqueById, formatDateLong } from "lib/helpers/helpers";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { PlanComplete } from "lib/types/plan";
import { WorkerWithAllergies } from "lib/types/worker";
import React, { useMemo, useState } from "react";

type Params = {
  params: {
    id: string;
  };
};

export default function PlanPage({ params }: Params) {
  const { data, error, isLoading, mutate } = useAPIPlan(params.id);
  const {
    data: workersWithoutJob,
    isLoading: isLoadingWorkersWithoutJob,
    mutate: reloadJoblessWorkers,
  } = useAPIWorkersWithoutJob(params.id);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const openModal = () => setIsJobModalOpen(true);
  const closeModal = () => {
    mutate();
    setIsJobModalOpen(false);
  };

  const updateJoblessWorkers = (expectedValue: WorkerWithAllergies[]) => {
    reloadJoblessWorkers([...expectedValue]);
  };

  const searchableJobs = useMemo(() => {
    const map = new Map<string, string>();
    data?.jobs.forEach((job) => {
      const workerNames = job.workers
        .map((w) => `${w.firstName} ${w.lastName}`)
        .join(" ");
      map.set(
        job.id,
        (
          job.proposedJob.name +
          job.proposedJob.area.name +
          job.proposedJob.address +
          workerNames
        ).toLocaleLowerCase()
      );
    });
    return map;
  }, [data?.jobs]);

  const areas = getAvailableAreas(data);
  const [selectedArea, setSelectedArea] = useState(areas[0]);

  const onAreaSelected = (id: string) => {
    setSelectedArea(areas.find((a) => a.id === id) || areas[0]);
  };

  const [filter, setFilter] = useState("");

  if (error) {
    return <ErrorPage error={error} />;
  }

  function shouldShowJob(job: ActiveJobNoPlan) {
    const isInArea =
      selectedArea.id === areas[0].id ||
      job.proposedJob.area.id === selectedArea.id;
    const text = searchableJobs.get(job.id);
    if (text) {
      return isInArea && text.includes(filter.toLowerCase());
    }
    return isInArea;
  }

  return (
    <>
      <PageHeader title={data ? formatDateLong(data?.day) : "Načítání..."}>
        <button className="btn btn-warning" type="button" onClick={openModal}>
          <i className="fas fa-briefcase"></i>
          <span>Přidat job</span>
        </button>
        <button className="btn btn-primary" type="button">
          <i className="fas fa-cog"></i>
          <span>Vygenerovat plán</span>
        </button>
        <button className="btn btn-primary" type="button">
          <i className="fas fa-print"></i>
          <span>Tisknout</span>
        </button>
      </PageHeader>

      <section>
        <div className="container-fluid">
          <div className="row gx-3">
            <div className="col">
              <PlanFilters
                search={filter}
                onSearchChanged={setFilter}
                areas={areas}
                selectedArea={selectedArea}
                onAreaSelected={onAreaSelected}
              />
            </div>
          </div>
          <div className="row gx-3">
            <div className="col-sm-12 col-lg-10">
              <PlanTable
                plan={data}
                isLoadingPlan={isLoading}
                shouldShowJob={shouldShowJob}
                joblessWorkers={workersWithoutJob || []}
                reloadJoblessWorkers={updateJoblessWorkers}
                isLoadingJoblessWorkers={isLoadingWorkersWithoutJob}
                reloadPlan={mutate}
              />
            </div>
            <div className="col-sm-12 col-lg-2">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Statistiky</h5>
                <hr />
                <ul className="list-group list-group-flush ">
                  <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                    Nasazených pracovníků
                    <span>{data?.jobs.flatMap((x) => x.workers).length}</span>
                  </li>
                  <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                    Bez práce
                    <span>{workersWithoutJob && workersWithoutJob.length}</span>
                  </li>
                  <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                    Naplánované joby
                    <span>{data && data.jobs.length}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {isJobModalOpen && (
          <Modal title={"Přidat job do plánu"} onClose={closeModal}>
            <AddJobToPlanForm planId={params.id} onComplete={closeModal} />
          </Modal>
        )}
      </section>
    </>
  );
}

function getAvailableAreas(plan?: PlanComplete) {
  const ALL_AREAS = { id: "all", name: "Vyberte oblast" };
  const jobs = plan?.jobs.flatMap((j) => j.proposedJob);
  const areas = filterUniqueById(
    jobs?.map((job) => ({ id: job.area.id, name: job.area.name })) || []
  );
  areas.sort((a, b) => a.name.localeCompare(b.name));
  areas.unshift(ALL_AREAS);
  return areas;
}
