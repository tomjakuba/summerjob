import {
  useAPIProposedJobDelete,
  useAPIProposedJobUpdate,
} from "lib/fetcher/proposed-job";
import { translateAllergies } from "lib/types/allergy";
import { ProposedJobComplete } from "lib/types/proposed-job";
import Link from "next/link";
import { useState } from "react";
import ConfirmationModal from "../modal/ConfirmationModal";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import { ExpandableRow } from "../table/ExpandableRow";

interface ProposedJobRowData {
  job: ProposedJobComplete;
  reloadJobs: () => void;
}

export default function ProposedJobRow({
  job,
  reloadJobs,
}: ProposedJobRowData) {
  const { trigger: triggerUpdate } = useAPIProposedJobUpdate(job.id, {
    onSuccess: reloadJobs,
  });

  const setJobPinned = (pinned: boolean) => {
    triggerUpdate({ pinned });
  };

  const setJobCompleted = (completed: boolean) => {
    triggerUpdate({ completed });
  };

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {
    trigger: triggerDelete,
    isMutating: isBeingDeleted,
    error: deleteError,
    reset: resetDeleteError,
  } = useAPIProposedJobDelete(job.id, {
    onSuccess: reloadJobs,
  });

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
    <ExpandableRow
      data={formatJobRow(
        job,
        setJobPinned,
        setJobCompleted,
        confirmDelete,
        isBeingDeleted
      )}
      className={rowColorClass(job)}
    >
      <div className="ms-2">
        <strong>Popis</strong>
        <p>{job.description}</p>
        <p>
          <strong>Počet pracovníků: </strong>
          {job.minWorkers} - {job.maxWorkers} ({job.strongWorkers} siláků)
        </p>
        <p>
          <strong>Doprava do oblasti požadována: </strong>
          {job.area.requiresCar ? "Ano" : "Ne"}
        </p>
        <p>
          <strong>Alergeny: </strong>
          {job.allergens.length > 0
            ? translateAllergies(job.allergens)
                .map((a) => a.code)
                .join(", ")
            : "Žádné"}
        </p>
        <p>
          <strong>Naplánované dny: </strong>
          {job.activeJobs.length} / {job.requiredDays}
        </p>
      </div>
      {showDeleteConfirmation && !deleteError && (
        <ConfirmationModal
          onConfirm={deleteJob}
          onReject={() => setShowDeleteConfirmation(false)}
        >
          <p>
            Opravdu chcete smazat job <b>{job.name}</b>?
          </p>
          {job.activeJobs.length > 0 && (
            <div className="alert alert-danger">
              Tento job je součástí alespoň jednoho plánu!
              <br /> Jeho odstraněním zároveň odstraníte i odpovídající
              naplánované akce.
            </div>
          )}
        </ConfirmationModal>
      )}
      {deleteError && (
        <ErrorMessageModal
          onClose={onErrorMessageClose}
          message={"Nepovedlo se odstranit job."}
        />
      )}
    </ExpandableRow>
  );
}

function rowColorClass(job: ProposedJobComplete) {
  if (job.completed) {
    return "smj-completed-job-row";
  }
  if (job.pinned) {
    return "smj-pinned-job-row";
  }
  return "";
}

function formatJobRow(
  job: ProposedJobComplete,
  setPinned: (pinned: boolean) => void,
  setCompleted: (completed: boolean) => void,
  deleteJob: () => void,
  isBeingDeleted: boolean
) {
  return [
    job.name,
    job.area.name,
    job.contact,
    job.address,
    `${job.activeJobs.length} / ${job.requiredDays}`,
    `${job.minWorkers} - ${job.maxWorkers}`,
    <span key={job.id} className="d-flex align-items-center gap-3">
      {markJobAsCompletedIcon(job, setCompleted)}
      {pinJobIcon(job, setPinned)}
      <Link
        href={`/jobs/${job.id}`}
        onClick={(e) => e.stopPropagation()}
        className="smj-action-edit"
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>
      {deleteJobIcon(deleteJob, isBeingDeleted)}
    </span>,
  ];
}

function markJobAsCompletedIcon(
  job: ProposedJobComplete,
  setCompleted: (completed: boolean) => void
) {
  const color = job.completed ? "smj-action-completed" : "smj-action-complete";
  const title = job.completed
    ? "Označit jako nedokončený"
    : "Označit jako dokončený";
  const icon = job.completed ? "fa-times" : "fa-check";
  return (
    <i
      className={`fas ${icon} ${color}`}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        setCompleted(!job.completed);
      }}
    ></i>
  );
}

function pinJobIcon(
  job: ProposedJobComplete,
  setPinned: (pinned: boolean) => void
) {
  const color = job.pinned ? "smj-action-pinned" : "smj-action-pin";
  const title = job.pinned ? "Odepnout" : "Připnout";
  const icon = job.pinned ? "fa-thumbtack" : "fa-thumbtack";
  return (
    <i
      className={`fas ${icon} ${color}`}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        setPinned(!job.pinned);
      }}
    ></i>
  );
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
