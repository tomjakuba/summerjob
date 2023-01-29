import { ActiveJobNoPlan } from "lib/types/active-job";
import { LoadingRow } from "../table/LoadingRow";
import type { Worker } from "lib/prisma/client";
import { ExpandableRow } from "../table/ExpandableRow";
import { PlanComplete } from "lib/types/plan";
import Link from "next/link";
import { SimpleRow } from "../table/SimpleRow";

const _columns = [
  "Práce",
  "Pracovníci",
  "Kontaktní osoba",
  "Oblast",
  "Adresa",
  "Zajištění",
  "Akce",
];

interface PlanTableProps {
  plan?: PlanComplete;
  isLoadingPlan: boolean;
  shouldShowJob: (job: ActiveJobNoPlan) => boolean;
  joblessWorkers: Worker[];
  isLoadingJoblessWorkers: boolean;
}

export function PlanTable({
  plan,
  isLoadingPlan,
  shouldShowJob,
  joblessWorkers,
  isLoadingJoblessWorkers,
}: PlanTableProps) {
  const onWorkerDragStart = (worker: Worker) => {
    return (e: React.DragEvent<HTMLTableRowElement>) => {
      e.dataTransfer.setData("text/plain", worker.id);
    };
  };

  const onWorkerDropped =
    (job: ActiveJobNoPlan) => (e: React.DragEvent<HTMLTableRowElement>) => {
      console.log(e.dataTransfer.getData("text/plain"), job.proposedJob.name);
    };

  return (
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
          {isLoadingPlan && <LoadingRow colspan={_columns.length} />}
          {!isLoadingPlan &&
            plan?.jobs.map(
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
                      <Link href={`/active-jobs/${job.id}`}>Upravit</Link>,
                    ]}
                    onDrop={onWorkerDropped(job)}
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
                        <p>
                          <strong>Zodpovědná osoba: </strong>
                          {responsibleWorkerName(job)}
                        </p>
                      </div>
                      <div className="table-responsive text-nowrap">
                        <table className="table table-hover">
                          <tbody>
                            {job.workers.length === 0 && (
                              <tr>
                                <td colSpan={3}>
                                  <i>Žádní pracovníci</i>
                                </td>
                              </tr>
                            )}
                            {job.workers.map((worker) => (
                              <SimpleRow
                                data={formatWorkerData(worker, job)}
                                key={worker.id}
                                draggable={true}
                                onDragStart={onWorkerDragStart(worker)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  </ExpandableRow>
                )
            )}
          {!isLoadingJoblessWorkers && (
            <ExpandableRow
              data={[`Bez práce (${joblessWorkers.length})`]}
              colspan={_columns.length}
              className={
                joblessWorkers.length > 0 ? "smj-background-error" : ""
              }
            >
              <div className="ms-2">
                <h6>Následující pracovníci nemají přiřazenou práci:</h6>
              </div>
              <div className="table-responsive text-nowrap">
                <table className="table table-hover">
                  <tbody>
                    {joblessWorkers.map((worker) => (
                      <SimpleRow
                        data={formatWorkerData(worker)}
                        key={worker.id}
                        draggable={true}
                        onDragStart={onWorkerDragStart(worker)}
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
  );
}

function formatRideData(job: ActiveJobNoPlan) {
  if (!job.ride) return <>Není</>;
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

function responsibleWorkerName(job: ActiveJobNoPlan) {
  if (!job.responsibleWorker) return "Není";
  return `${job.responsibleWorker?.firstName} ${job.responsibleWorker?.lastName}`;
}
