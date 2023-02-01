import { ActiveJobNoPlan } from "lib/types/active-job";
import { LoadingRow } from "../table/LoadingRow";
import type { Worker } from "lib/prisma/client";
import { ExpandableRow } from "../table/ExpandableRow";
import { PlanComplete, PlanUpdateMoveWorker } from "lib/types/plan";
import Link from "next/link";
import { SimpleRow } from "../table/SimpleRow";
import {
  SortableColumn,
  SortableTable,
  SortOrder,
} from "../table/SortableTable";
import { useMemo, useState } from "react";

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
  const [sortOrder, setSortOrder] = useState<SortOrder>({
    columnId: undefined,
    direction: "desc",
  });
  const onSortRequested = (direction: SortOrder) => {
    setSortOrder(direction);
  };
  const sortedJobs = useMemo(() => {
    return plan ? sortJobsInPlan(plan, sortOrder) : [];
  }, [sortOrder, plan?.jobs]);

  const onWorkerDragStart = (worker: Worker, sourceId: string) => {
    return (e: React.DragEvent<HTMLTableRowElement>) => {
      e.dataTransfer.setData("worker-id", worker.id);
      e.dataTransfer.setData("source-id", sourceId);
    };
  };

  const onWorkerDropped =
    (job: ActiveJobNoPlan) => (e: React.DragEvent<HTMLTableRowElement>) => {
      const workerId = e.dataTransfer.getData("worker-id");
      const fromJobId = e.dataTransfer.getData("source-id");
      const toJobId = job.id;
      const fromRideId =
        sortedJobs.find((j) => j.id === fromJobId)?.rideId || undefined;
      const toRideId = job.rideId || undefined;
      const updateObject: PlanUpdateMoveWorker = {
        workerId,
        fromJobId,
        toJobId,
        fromRideId,
        toRideId,
      };
      console.log(updateObject);
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

function formatRideData(job: ActiveJobNoPlan) {
  if (!job.ride) return <>Není</>;
  let result = `${job.ride.car.name} - ${job.ride.driver.firstName} ${
    job.ride.driver.lastName
  } (obsazenost: ${job.ride.passengers.length + 1}/${job.ride.car.seats})`;
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
