import {
  ActiveJobNoPlan,
  UpdateActiveJobSerializable,
} from "lib/types/active-job";
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
import { DragEvent, useMemo, useState } from "react";
import { useAPIPlanMoveWorker } from "lib/fetcher/plan";
import { WorkerComplete, WorkerWithAllergies } from "lib/types/worker";
import { RideComplete } from "lib/types/ride";
import { useAPIActiveJobUpdate } from "lib/fetcher/active-job";
import { SWRMutationResponse } from "swr/mutation";
import { Key } from "swr";
import { PlanJobRow } from "./PlanJobRow";

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
  reloadPlan: () => void;
}

export function PlanTable({
  plan,
  isLoadingPlan,
  shouldShowJob,
  joblessWorkers,
  reloadJoblessWorkers,
  isLoadingJoblessWorkers,
  reloadPlan,
}: PlanTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>({
    columnId: "name",
    direction: "asc",
  });
  const onSortRequested = (direction: SortOrder) => {
    setSortOrder(direction);
  };
  const sortedJobs = useMemo(() => {
    return plan ? sortJobsInPlan(plan, sortOrder) : [];
  }, [sortOrder, plan]);

  const onWorkerDragStart = (worker: Worker, sourceId: string) => {
    return (e: React.DragEvent<HTMLTableRowElement>) => {
      e.dataTransfer.setData("worker-id", worker.id);
      e.dataTransfer.setData("source-id", sourceId);
    };
  };

  const reload = () => {
    reloadPlan();
    reloadJoblessWorkers(joblessWorkers);
  };

  return (
    <SortableTable
      columns={_columns}
      currentSort={sortOrder}
      onRequestedSort={onSortRequested}
    >
      {isLoadingPlan && <LoadingRow colspan={_columns.length} />}
      {!isLoadingPlan &&
        sortedJobs.map((job) => (
          <PlanJobRow
            key={job.id}
            isDisplayed={shouldShowJob(job)}
            job={job}
            formatWorkerData={formatWorkerData}
            onWorkerDragStart={onWorkerDragStart}
            reloadPlan={reload}
          />
        ))}
      {!isLoadingJoblessWorkers && (
        <ExpandableRow
          data={[`Bez práce (${joblessWorkers.length})`]}
          colspan={_columns.length}
          className={joblessWorkers.length > 0 ? "smj-background-error" : ""}
          // onDrop={onWorkerDropped("jobless")}
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

function moveWorkerToJob(
  workerId: string,
  fromJobId: string,
  toJobId: string,
  plan: PlanComplete,
  joblessWorkers: WorkerWithAllergies[],
  updateHooks: {
    id: string;
    hook: SWRMutationResponse<any, any, UpdateActiveJobSerializable, Key>;
  }[],
  reloadJoblessWorkers: (workers: WorkerWithAllergies[]) => void
) {
  const planCopy = structuredClone(plan!);
  const isFromJobless = fromJobId === "jobless";
  const isToJobless = toJobId === "jobless";
  let worker: WorkerWithAllergies | WorkerComplete;
  if (isFromJobless && isToJobless) return;

  let joblessCopy = [...joblessWorkers];
  let fromJob = planCopy.jobs.find((j) => j.id === fromJobId);
  let toJob = planCopy.jobs.find((j) => j.id === toJobId);

  if (isFromJobless) {
    worker = joblessCopy.find((w) => w.id === workerId)!;
    joblessCopy = joblessCopy.filter((w) => w.id !== workerId);
  } else {
    fromJob = fromJob!;
    worker = fromJob.workers.find((w) => w.id === workerId)!;
    fromJob.workers = fromJob.workers.filter((w) => w.id !== workerId);
    const fromRide =
      fromJob.rides.find((r) => r.driverId === workerId) ||
      fromJob.rides.find((r) => r.passengers.includes(worker));
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
    const updateData: UpdateActiveJobSerializable = {
      workerIds: fromJob!.workers.map((w) => w.id),
    };
    const trigger = updateHooks.find((h) => h.id === fromJobId)!.hook.trigger;
    trigger(updateData);
  } else {
    toJob = toJob!;
    toJob.workers.push(worker!);
    const toRide = toJob.rides[0];
    if (toRide) {
      toRide.passengers.push(worker);
    }
    const updateData: UpdateActiveJobSerializable = {
      workerIds: toJob.workers.map((w) => w.id),
    };
    const trigger = updateHooks.find((h) => h.id === toJobId)!.hook.trigger;
    trigger(updateData);
  }

  // optimisticUpdatePlan({...oldPlan, ...planCopy})

  // triggerMoveWorker(planCopy, {
  //   optimisticData: (oldPlan: PlanComplete) => {
  //     return { ...oldPlan, ...planCopy };
  //   },
  // });
  // reloadJoblessWorkers(joblessCopy);
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
