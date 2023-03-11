import { ActiveJobNoPlan } from "lib/types/active-job";
import { RideComplete } from "lib/types/ride";
import { WorkerWithAllergies } from "lib/types/worker";
import Link from "next/link";
import { ExpandableRow } from "../table/ExpandableRow";
import { SimpleRow } from "../table/SimpleRow";
import type { Worker } from "lib/prisma/client";
import { useAPIActiveJobUpdate } from "lib/fetcher/active-job";
import { translateAllergies } from "lib/types/allergy";

interface PlanJobRowProps {
  job: ActiveJobNoPlan;
  planId: string;
  isDisplayed: boolean;
  formatWorkerData: (
    worker: WorkerWithAllergies,
    job: ActiveJobNoPlan
  ) => (string | JSX.Element)[];
  onWorkerDragStart: (
    worker: Worker,
    sourceId: string
  ) => (e: React.DragEvent<HTMLTableRowElement>) => void;
  reloadPlan: () => void;
}

export function PlanJobRow({
  job,
  planId,
  isDisplayed,
  formatWorkerData,
  onWorkerDragStart,
  reloadPlan,
}: PlanJobRowProps) {
  const { trigger, isMutating, error } = useAPIActiveJobUpdate(job.id);

  const onWorkerDropped =
    (toJobId: string) => (e: React.DragEvent<HTMLTableRowElement>) => {
      const workerId = e.dataTransfer.getData("worker-id");
      const fromJobId = e.dataTransfer.getData("source-id");
      if (fromJobId === toJobId) {
        return;
      }

      const newWorkers = [...job.workers.map((w) => w.id), workerId];
      trigger(
        { workerIds: newWorkers },
        {
          onSuccess: () => {
            reloadPlan();
          },
        }
      );
    };
  return (
    <>
      {isDisplayed && (
        <>
          <ExpandableRow
            key={job.id}
            data={formatRowData(job)}
            onDrop={onWorkerDropped(job.id)}
          >
            <>
              <div className="ms-2">
                <strong>Poznámka pro organizátory</strong>
                <p>{job.privateDescription}</p>
                <strong>Popis</strong>
                <p>{job.publicDescription}</p>

                <strong>Doprava</strong>
                <p>{formatRideData(job)}</p>
                <strong>Alergeny</strong>
                <p>{formatAllergens(job)}</p>
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
                        onDragStart={onWorkerDragStart(worker, job.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          </ExpandableRow>
        </>
      )}
    </>
  );
}

function formatRideData(job: ActiveJobNoPlan) {
  if (!job.rides || job.rides.length == 0) return <>Není</>;

  const formatSingleRide = (ride: RideComplete) => {
    const isDriverFromJob = job.workers.find((w) => w.id === ride.driverId);
    const otherJobs = ride.jobs.filter((j) => j.id !== job.id);

    return (
      <>
        {ride.car.name}: {ride.driver.firstName} {ride.driver.lastName}{" "}
        (obsazenost: {ride.passengers.length + 1}/{ride.car.seats})
        {!isDriverFromJob && <i>(řidič z jiného jobu)</i>}
        <br />
        {isDriverFromJob && otherJobs.length > 0 && (
          <>
            Dále odváží: {otherJobs.map((j) => j.proposedJob.name).join(", ")}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {job.rides.map((r) => (
        <span key={r.id}>{formatSingleRide(r)}</span>
      ))}
    </>
  );
}

function responsibleWorkerName(job: ActiveJobNoPlan) {
  if (!job.responsibleWorker) return "Není";
  return `${job.responsibleWorker?.firstName} ${job.responsibleWorker?.lastName}`;
}

function formatAmenities(job: ActiveJobNoPlan) {
  return (
    <>
      {job.proposedJob.hasFood && (
        <i className="fas fa-utensils me-2" title="Jídlo na místě"></i>
      )}{" "}
      {job.proposedJob.hasShower && (
        <i className="fas fa-shower" title="Sprcha na místě"></i>
      )}
    </>
  );
}

function formatAllergens(job: ActiveJobNoPlan) {
  if (job.proposedJob.allergens.length == 0) return "Žádné";
  return translateAllergies(job.proposedJob.allergens)
    .map((a) => a.code)
    .join(", ");
}

function formatRowData(job: ActiveJobNoPlan) {
  return [
    job.proposedJob.name,
    `${job.workers.length}/${job.proposedJob.maxWorkers}`,
    job.proposedJob.contact,
    job.proposedJob.area.name,
    job.proposedJob.address,
    formatAmenities(job),
    <span
      key={job.id}
      className="d-flex align-items-center gap-3 smj-table-actions-cell"
    >
      <Link
        href={`/plans/${job.planId}/${job.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>

      <i
        className="fas fa-trash-alt smj-action-delete cursor-pointer"
        title="Smazat"
        onClick={() => {}}
      ></i>
      <span style={{ width: "0px" }}></span>
    </span>,
  ];
}
