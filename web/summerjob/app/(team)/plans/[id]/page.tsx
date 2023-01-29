"use client";
import ErrorPage from "lib/components/error-page/error";
import AddJobToPlanForm from "lib/components/forms/AddJobToPlanForm";
import { Modal } from "lib/components/modal/Modal";
import PageHeader from "lib/components/page-header/PageHeader";
import { PlanFilters } from "lib/components/plan/PlanFilters";
import { ExpandableRow } from "lib/components/table/ExpandableRow";
import { LoadingRow } from "lib/components/table/LoadingRow";
import { SimpleRow } from "lib/components/table/SimpleRow";
import { useAPIPlan, useAPIWorkersWithoutJob } from "lib/fetcher/fetcher";
import { formatDateLong } from "lib/helpers/helpers";
import type { Worker } from "lib/prisma/client";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { PlanComplete } from "lib/types/plan";
import Link from "next/link";
import { useMemo, useState } from "react";

const _columns = [
  "Práce",
  "Pracovníci",
  "Kontaktní osoba",
  "Oblast",
  "Adresa",
  "Zajištění",
  "Akce",
];

type Params = {
  params: {
    id: string;
  };
};

export default function PlanPage({ params }: Params) {
  const { data, error, isLoading, mutate } = useAPIPlan(params.id);
  const { data: workersWithoutJob, isLoading: isLoadingWorkersWithoutJob } =
    useAPIWorkersWithoutJob(params.id);

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const openModal = () => setIsJobModalOpen(true);
  const closeModal = () => {
    mutate();
    setIsJobModalOpen(false);
  };

  if (error) {
    return <ErrorPage error={error} />;
  }

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
                      data.jobs.map(
                        (job) =>
                          shouldShowJob(job) && (
                            <ExpandableRow
                              key={job.id}
                              data={[
                                job.proposedJob.name,
                                `${job.workers.length}/${job.proposedJob.maxWorkers}`,
                                job.proposedJob.contact,
                                job.proposedJob.area.name,
                                job.proposedJob.address,
                                "Zajištění",
                                <Link href={`/active-jobs/${job.id}`}>
                                  Upravit
                                </Link>,
                              ]}
                            >
                              <>
                                <div className="ms-2">
                                  <h6>Poznámka pro organizátory</h6>
                                  <p>{job.privateDescription}</p>
                                  <h6>Popis</h6>
                                  <p>{job.publicDescription}</p>
                                  <p>
                                    <strong>Doprava: </strong>
                                    {formatRideData(job)}
                                  </p>
                                </div>
                                <div className="table-responsive text-nowrap">
                                  <table className="table table-hover">
                                    <tbody>
                                      {job.workers.map((worker) => (
                                        <SimpleRow
                                          data={formatWorkerData(worker, job)}
                                          key={worker.id}
                                        />
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            </ExpandableRow>
                          )
                      )}
                    {!isLoadingWorkersWithoutJob &&
                      workersWithoutJob !== undefined && (
                        <ExpandableRow
                          data={[`Bez práce (${workersWithoutJob.length})`]}
                          colspan={_columns.length}
                          className={
                            workersWithoutJob.length > 0
                              ? "smj-background-error"
                              : ""
                          }
                        >
                          <div className="ms-2">
                            <h6>
                              Následující pracovníci nemají přiřazenou práci:
                            </h6>
                          </div>
                          <div className="table-responsive text-nowrap">
                            <table className="table table-hover">
                              <tbody>
                                {workersWithoutJob.map((worker) => (
                                  <SimpleRow
                                    data={formatWorkerData(worker)}
                                    key={worker.id}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </ExpandableRow>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-sm-12 col-lg-2">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Statistiky</h5>
                <hr />
                Nasazených pracovníků:{" "}
                {data?.jobs.flatMap((x) => x.workers).length}
                <br />
                Bez práce: {workersWithoutJob && workersWithoutJob.length}
                <br />
                Naplánované joby: {data && data.jobs.length}
              </div>
            </div>
          </div>
        </div>
        <Modal
          visible={isJobModalOpen}
          title={"Přidat job do plánu"}
          onClose={closeModal}
        >
          <AddJobToPlanForm planId={params.id} onComplete={closeModal} />
        </Modal>
      </section>
    </>
  );
}

function formatWorkerData(worker: Worker, job?: ActiveJobNoPlan) {
  let name = `${worker.firstName} ${worker.lastName}`;
  const abilities = [];
  let isDriver = false;
  if (worker.id === job?.ride?.driverId) {
    isDriver = true;
    abilities.push("Řidič");
  }
  if (worker.isStrong) abilities.push("Silák");

  return [
    isDriver ? (
      <>
        {name} <i className="fas fa-car ms-2"></i>
      </>
    ) : (
      name
    ),
    worker.phone,
    abilities.join(", "),
    <>
      <a className="me-3" href="#">
        Odstranit
      </a>
      <a href="#">Přesunout</a>
    </>,
  ];
}

function formatRideData(job: ActiveJobNoPlan) {
  if (!job.ride) return <>Ne</>;
  let result = `${job.ride.car.name} - ${job.ride.driver.firstName} ${job.ride.driver.lastName}`;
  let otherJobNames = "";

  if (!job.workers.find((w) => w.id === job.ride.driverId)) {
    result += ` (sdílená jízda)`;
  } else if (job.ride.forJobs.length > 1) {
    const otherJobs = job.ride.forJobs.filter((j) => j.id !== job.id);
    otherJobNames = `Také odváží: ${otherJobs
      .map((j) => j.proposedJob.name)
      .join(", ")}}`;
  }
  return (
    <>
      {result}
      {otherJobNames.length > 0 && (
        <>
          <br />
          {otherJobNames}
        </>
      )}
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

function filterUniqueById<T extends { id: string }>(elements: T[]): T[] {
  return Array.from(new Map(elements.map((item) => [item.id, item])).values());
}
