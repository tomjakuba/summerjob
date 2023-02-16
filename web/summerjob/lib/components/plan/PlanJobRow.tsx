import { ActiveJobNoPlan } from "lib/types/active-job";
import { RideComplete } from "lib/types/ride";
import { WorkerWithAllergies } from "lib/types/worker";
import Link from "next/link";
import { ExpandableRow } from "../table/ExpandableRow";
import { SimpleRow } from "../table/SimpleRow";
import type { Worker } from "lib/prisma/client";
import { useAPIActiveJobUpdate } from "lib/fetcher/active-job";

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
            data={[
              job.proposedJob.name,
              `${job.workers.length}/${job.proposedJob.maxWorkers}`,
              job.proposedJob.contact,
              job.proposedJob.area.name,
              job.proposedJob.address,
              formatAmenities(job),
              <Link
                key={job.id}
                href={`/plans/${planId}/${job.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                Upravit
              </Link>,
            ]}
            onDrop={onWorkerDropped(job.id)}
          >
            <>
              <div className="ms-2">
                <h6>Poznámka pro organizátory</h6>
                <p>{job.privateDescription}</p>
                <h6>Popis</h6>
                <p>{job.publicDescription}</p>

                <h6>Doprava: </h6>
                <p>{formatRideData(job)}</p>
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
