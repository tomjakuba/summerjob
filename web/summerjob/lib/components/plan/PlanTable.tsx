import { ActiveJobNoPlan } from "lib/types/active-job";
import { LoadingRow } from "../table/LoadingRow";
import type { Worker } from "lib/prisma/client";
import { ExpandableRow } from "../table/ExpandableRow";
import { PlanComplete } from "lib/types/plan";
import Link from "next/link";
import { SimpleRow } from "../table/SimpleRow";
import {
  SortableColumn,
  SortableTable,
  SortOrder,
} from "../table/SortableTable";
import { useMemo, useState } from "react";
import { useAPIPlanMoveWorker } from "lib/fetcher/plan";
import { WorkerComplete, WorkerWithAllergies } from "lib/types/worker";
import { RideComplete } from "lib/types/ride";

const _columns: SortableColumn[] = [
  { id: "name", name: "Práce", sortable: true },
  { id: "workers", name: "Pracovníci", sortable: true },
  { id: "contact", name: "Kontaktní osoba", sortable: true },
  { id: "area", name: "Oblast", sortable: true },
  { id: "address", name: "Adresa", sortable: true },
  { id: "amenities", name: "Zajištění", sortable: false },
  { id: "actions", name: "Akce", sortable: false },
];

interface PlanTableProps {
  plan?: PlanComplete;
  isLoadingPlan: boolean;
  shouldShowJob: (job: ActiveJobNoPlan) => boolean;
  joblessWorkers: WorkerComplete[];
  reloadJoblessWorkers: (expectedResult: WorkerComplete[]) => void;
  isLoadingJoblessWorkers: boolean;
}

export function PlanTable({
  plan,
  isLoadingPlan,
  shouldShowJob,
  joblessWorkers,
  reloadJoblessWorkers,
  isLoadingJoblessWorkers,
}: PlanTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>({
    columnId: undefined,
    direction: "desc",
  });
  const onSortRequested = (direction: SortOrder) => {
    setSortOrder(direction);
  };
  const sortedJobs = useMemo(() => {
    return plan ? sortJobsInPlan(plan, sortOrder) : [];
  }, [sortOrder, plan]);

  const {
    trigger: triggerMoveWorker,
    isMutating,
    error: moveWorkerError,
  } = useAPIPlanMoveWorker(plan?.id || "");
  const onWorkerDragStart = (worker: Worker, sourceId: string) => {
    return (e: React.DragEvent<HTMLTableRowElement>) => {
      e.dataTransfer.setData("worker-id", worker.id);
      e.dataTransfer.setData("source-id", sourceId);
    };
  };

  const onWorkerDropped =
    (toJobId: string) => (e: React.DragEvent<HTMLTableRowElement>) => {
      const workerId = e.dataTransfer.getData("worker-id");
      const fromJobId = e.dataTransfer.getData("source-id");
      if (fromJobId === toJobId) {
        return;
      }
      moveWorkerToJob(
        workerId,
        fromJobId,
        toJobId,
        plan!,
        joblessWorkers,
        triggerMoveWorker,
        reloadJoblessWorkers
      );
    };

  return (
    <SortableTable
      columns={_columns}
      currentSort={sortOrder}
      onRequestedSort={onSortRequested}
    >
      {isLoadingPlan && <LoadingRow colspan={_columns.length} />}
      {!isLoadingPlan &&
        sortedJobs.map(
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
                  formatAmenities(job),
                  <Link key={job.id} href={`/active-jobs/${job.id}`}>
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
            )
        )}
      {!isLoadingJoblessWorkers && (
        <ExpandableRow
          data={[`Bez práce (${joblessWorkers.length})`]}
          colspan={_columns.length}
          className={joblessWorkers.length > 0 ? "smj-background-error" : ""}
          onDrop={onWorkerDropped("jobless")}
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
                    onDragStart={onWorkerDragStart(worker, "jobless")}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </ExpandableRow>
      )}
    </SortableTable>
  );
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

function formatWorkerData(worker: Worker, job?: ActiveJobNoPlan) {
  let name = `${worker.firstName} ${worker.lastName}`;
  const abilities = [];
  let isDriver = false;
  if (job?.rides.map((r) => r.driverId).includes(worker.id)) {
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

function sortJobsInPlan(data: PlanComplete, sortOrder: SortOrder) {
  if (sortOrder.columnId === undefined) {
    return data.jobs;
  }
  const jobs = [...data.jobs];

  const getSortable: {
    [b: string]: (job: ActiveJobNoPlan) => string | number;
  } = {
    name: (job) => job.proposedJob.name,
    area: (job) => job.proposedJob.area.name,
    address: (job) => job.proposedJob.address,
    days: (job) => job.proposedJob.requiredDays,
    contact: (job) => job.proposedJob.contact,
    workers: (job) =>
      `${job.proposedJob.minWorkers}/${job.proposedJob.maxWorkers}`,
  };

  if (sortOrder.columnId in getSortable) {
    const sortKey = getSortable[sortOrder.columnId];
    return jobs.sort((a, b) => {
      if (sortKey(a) < sortKey(b)) {
        return sortOrder.direction === "desc" ? 1 : -1;
      }
      if (sortKey(a) > sortKey(b)) {
        return sortOrder.direction === "desc" ? -1 : 1;
      }
      return 0;
    });
  }
  return jobs;
}

function moveWorkerToJob(
  workerId: string,
  fromJobId: string,
  toJobId: string,
  plan: PlanComplete,
  joblessWorkers: WorkerWithAllergies[],
  triggerMoveWorker: (plan: PlanComplete, options?: any) => void,
  reloadJoblessWorkers: (workers: WorkerWithAllergies[]) => void
) {
  const planCopy = structuredClone(plan!);
  const isFromJobless = fromJobId === "jobless";
  const isToJobless = toJobId === "jobless";
  let worker: WorkerWithAllergies | WorkerComplete;

  let joblessCopy = [...joblessWorkers];
  if (isFromJobless) {
    worker = joblessCopy.find((w) => w.id === workerId)!;
    joblessCopy = joblessCopy.filter((w) => w.id !== workerId);
  } else {
    const fromJob = planCopy.jobs.find((j) => j.id === fromJobId)!;
    worker = fromJob.workers.find((w) => w.id === workerId)!;
    fromJob.workers = fromJob.workers.filter((w) => w.id !== workerId);
    const fromRide =
      fromJob.rides.find((r) => r.driverId === workerId) ||
      fromJob.rides.find((r) => r.passengers.includes(worker));
    // TODO remove from ride
    if (fromRide) {
      if (fromRide.driverId === workerId) {
        fromJob.rides.splice(fromJob.rides.indexOf(fromRide), 1);
      } else {
        fromRide.passengers = fromRide.passengers.filter(
          (p) => p.id !== workerId
        );
      }
    }
  }
  if (isToJobless) {
    joblessCopy.push(worker!);
  } else {
    const toJob = planCopy.jobs.find((j) => j.id === toJobId)!;
    toJob.workers.push(worker!);
    const toRide = toJob.rides[0];
    // TODO add to ride
    if (toRide) {
      toRide.passengers.push(worker);
    }
  }

  triggerMoveWorker(planCopy, {
    optimisticData: (oldPlan: PlanComplete) => {
      return { ...oldPlan, ...planCopy };
    },
  });
  reloadJoblessWorkers(joblessCopy);
}
