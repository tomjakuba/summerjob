import { ActiveJobNoPlan } from "lib/types/active-job";
import { RideComplete, RidesForJob } from "lib/types/ride";
import { WorkerComplete } from "lib/types/worker";
import Link from "next/link";
import { ExpandableRow } from "../table/ExpandableRow";
import { SimpleRow } from "../table/SimpleRow";
import type { Worker } from "lib/prisma/client";
import {
  useAPIActiveJobDelete,
  useAPIActiveJobUpdate,
} from "lib/fetcher/active-job";
import { translateAllergies } from "lib/types/allergy";
import { useState } from "react";
import ConfirmationModal from "../modal/ConfirmationModal";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import AddRideButton from "./AddRideButton";
import RideSelect from "./RideSelect";

interface PlanJobRowProps {
  job: ActiveJobNoPlan;
  isDisplayed: boolean;
  rides: RidesForJob[];
  onWorkerDragStart: (
    worker: Worker,
    sourceId: string
  ) => (e: React.DragEvent<HTMLTableRowElement>) => void;
  reloadPlan: () => void;
}

export function PlanJobRow({
  job,
  isDisplayed,
  rides,
  onWorkerDragStart,
  reloadPlan,
}: PlanJobRowProps) {
  const {
    trigger: triggerUpdate,
    isMutating: isBeingUpdated,
    error: updatingError,
  } = useAPIActiveJobUpdate(job.id, job.planId, {
    onSuccess: () => {
      reloadPlan();
    },
  });
  const {
    trigger: triggerDelete,
    isMutating: isBeingDeleted,
    error: deleteError,
    reset: resetDeleteError,
  } = useAPIActiveJobDelete(job.id, job.planId, {
    onSuccess: reloadPlan,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const ridesForOtherJobs = rides.filter((r) => r.jobId !== job.id);

  const onWorkerDropped =
    (toJobId: string) => (e: React.DragEvent<HTMLTableRowElement>) => {
      const workerId = e.dataTransfer.getData("worker-id");
      const fromJobId = e.dataTransfer.getData("source-id");
      if (fromJobId === toJobId) {
        return;
      }

      const newWorkers = [...job.workers.map((w) => w.id), workerId];
      triggerUpdate({ workerIds: newWorkers });
    };

  const deleteJob = () => {
    triggerDelete();
    setShowDeleteConfirmation(false);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const onErrorMessageClose = () => {
    resetDeleteError();
  };

  return (
    <>
      {isDisplayed && (
        <ExpandableRow
          key={job.id}
          data={formatRowData(job, confirmDelete, isBeingDeleted)}
          onDrop={onWorkerDropped(job.id)}
        >
          <>
            <div className="ms-2">
              <strong>Poznámka pro organizátory</strong>
              <p>{job.privateDescription}</p>
              <strong>Popis</strong>
              <p>{job.publicDescription}</p>

              <div className="d-flex gap-1">
                <strong>Doprava</strong>
                <AddRideButton job={job} />
              </div>

              <p>{formatRideData(job, ridesForOtherJobs)}</p>
              <strong>Alergeny</strong>
              <p>{formatAllergens(job)}</p>
              <p>
                <strong>Zodpovědná osoba: </strong>
                {responsibleWorkerName(job)}
              </p>
            </div>
            <div className="table-responsive text-nowrap">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>
                      <strong>Pracovník</strong>
                    </th>
                    <th>
                      <strong>Kontakt</strong>
                    </th>
                    <th>
                      <strong>Vlastnosti</strong>
                    </th>
                    <th>
                      <strong>Alergie</strong>
                    </th>
                    <th>
                      <strong>Doprava</strong>
                    </th>
                    <th>
                      <strong>Akce</strong>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {job.workers.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <i>Žádní pracovníci</i>
                      </td>
                    </tr>
                  )}

                  {job.workers.map((worker) => (
                    <SimpleRow
                      data={formatWorkerData(
                        worker,
                        job,
                        ridesForOtherJobs,
                        reloadPlan
                      )}
                      key={worker.id}
                      draggable={true}
                      onDragStart={onWorkerDragStart(worker, job.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
          {showDeleteConfirmation && !deleteError && (
            <ConfirmationModal
              onConfirm={deleteJob}
              onReject={() => setShowDeleteConfirmation(false)}
            >
              <p>
                Opravdu chcete smazat job <b>{job.proposedJob.name}</b>?
              </p>
            </ConfirmationModal>
          )}
          {deleteError && (
            <ErrorMessageModal
              onClose={onErrorMessageClose}
              message={"Nepovedlo se odstranit job."}
            />
          )}
        </ExpandableRow>
      )}
    </>
  );
}

function formatRideData(
  job: ActiveJobNoPlan,
  ridesForOtherJobs: RidesForJob[]
) {
  if (!job.rides || job.rides.length == 0) return <>Není</>;

  const formatSingleRide = (ride: RideComplete, index: number) => {
    // const passengersFromOtherJobs = ride.passengers.filter(
    //   (p) => !job.workers.map((w) => w.id).includes(p.id)
    // );
    // FIXME - zobrazit i jiné pracovníky, kteří jsou v jiných jobech
    return (
      <>
        {index + 1}
        {")"} {ride.car.name}: {ride.driver.firstName} {ride.driver.lastName}{" "}
        (obsazenost: {ride.passengers.length + 1}/{ride.car.seats})
        <br />
        {/* {passengersFromOtherJobs.length > 0 && (
          <>
            {passengersFromOtherJobs
              .map((p) => `${p.firstName} ${p.lastName}`)
              .join(", ")}
          </>
        )} */}
      </>
    );
  };

  return (
    <>
      {job.rides.map((r, index) => (
        <span key={r.id}>{formatSingleRide(r, index)}</span>
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

function formatRowData(
  job: ActiveJobNoPlan,
  deleteJob: () => void,
  isBeingDeleted: boolean
) {
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
        className="smj-action-edit"
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>

      {deleteJobIcon(deleteJob, isBeingDeleted)}
      <span style={{ width: "0px" }}></span>
    </span>,
  ];
}

function deleteJobIcon(deleteJob: () => void, isBeingDeleted: boolean) {
  return (
    <>
      {!isBeingDeleted && (
        <>
          <i
            className="fas fa-trash-alt smj-action-delete"
            title="Smazat"
            onClick={(e) => {
              e.stopPropagation();
              deleteJob();
            }}
          ></i>
          <span style={{ width: "0px" }}></span>
        </>
      )}
      {isBeingDeleted && (
        <i
          className="fas fa-spinner smj-action-delete spinning"
          title="Odstraňování..."
        ></i>
      )}
    </>
  );
}

function formatWorkerData(
  worker: WorkerComplete,
  job: ActiveJobNoPlan,
  rides: RidesForJob[],
  reloadPlan: () => void
) {
  let name = `${worker.firstName} ${worker.lastName}`;
  const abilities = [];
  let isDriver = false;
  if (job?.rides.map((r) => r.driverId).includes(worker.id)) {
    isDriver = true;
  }
  if (worker.cars.length > 0) abilities.push("Auto");
  if (worker.isStrong) abilities.push("Silák");
  const allergies = translateAllergies(worker.allergies);

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
    allergies.map((a) => a.code).join(", "),
    <RideSelect
      key={`rideselect-${worker.id}`}
      worker={worker}
      job={job}
      otherRides={rides}
      onRideChanged={reloadPlan}
    />,
    <>
      <a className="me-3" href="#">
        Odstranit
      </a>
      <a href="#">Přesunout</a>
    </>,
  ];
}
