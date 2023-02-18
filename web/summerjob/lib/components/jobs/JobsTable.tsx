import { ProposedJobComplete } from "lib/types/proposed-job";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExpandableRow } from "../table/ExpandableRow";
import { LoadingRow } from "../table/LoadingRow";
import {
  SortableColumn,
  SortableTable,
  SortOrder,
} from "../table/SortableTable";

const _columns: SortableColumn[] = [
  { id: "name", name: "Název", sortable: true },
  { id: "area", name: "Lokalita", sortable: true },
  { id: "contact", name: "Kontaktní osoba", sortable: false },
  { id: "address", name: "Adresa", sortable: false },
  { id: "days", name: "Naplánované dny", sortable: true },
  { id: "workers", name: "Počet pracovníků", sortable: true },
  { id: "actions", name: "Akce", sortable: false },
];

interface JobsTableProps {
  data: ProposedJobComplete[];
  isLoading: boolean;
  shouldShowJob: (job: ProposedJobComplete) => boolean;
}

export function JobsTable({ data, isLoading, shouldShowJob }: JobsTableProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>({
    columnId: undefined,
    direction: "desc",
  });
  const onSortRequested = (direction: SortOrder) => {
    setSortOrder(direction);
  };
  const sortedData = useMemo(
    () => sortJobs(data, sortOrder),
    [sortOrder, data]
  );

  return (
    <SortableTable
      columns={_columns}
      currentSort={sortOrder}
      onRequestedSort={onSortRequested}
    >
      {isLoading && <LoadingRow colspan={_columns.length} />}
      {!isLoading &&
        sortedData.map(
          (job) =>
            shouldShowJob(job) && (
              <ExpandableRow key={job.id} data={formatJobRow(job)}>
                <>
                  <div className="ms-2">
                    <h6>Popis</h6>
                    <p>{job.description}</p>
                    <p>
                      <strong>Počet pracovníků: </strong>
                      {job.minWorkers} - {job.maxWorkers} ({job.strongWorkers}{" "}
                      siláků)
                    </p>
                    <p>
                      <strong>Doprava do oblasti požadována: </strong>
                      {job.area.requiresCar ? "Ano" : "Ne"}
                    </p>
                    <p>
                      <strong>Naplánované dny: </strong>
                      {job.activeJobs.length} / {job.requiredDays}
                    </p>
                  </div>
                </>
              </ExpandableRow>
            )
        )}
    </SortableTable>
  );
}

function formatJobRow(job: ProposedJobComplete) {
  return [
    job.name,
    job.area.name,
    job.contact,
    job.address,
    `${job.activeJobs.length} / ${job.requiredDays}`,
    `${job.minWorkers} - ${job.maxWorkers}`,
    <span className="d-flex align-items-center gap-3 smj-table-actions-cell">
      <i
        className="fas fa-check smj-action-complete"
        title="Označit jako dokončený"
      ></i>
      <i className="fas fa-thumbtack" title="Připnout"></i>
      <Link
        key={job.id}
        href={`/jobs/${job.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>
      <i className="fas fa-trash-alt smj-action-delete" title="Smazat"></i>
    </span>,
  ];
}

function sortJobs(data: ProposedJobComplete[], sortOrder: SortOrder) {
  if (sortOrder.columnId === undefined) {
    return data;
  }
  data = [...data];

  const getSortable: {
    [b: string]: (job: ProposedJobComplete) => string | number;
  } = {
    name: (job) => job.name,
    area: (job) => job.area.name,
    address: (job) => job.address,
    days: (job) => job.activeJobs.length,
    workers: (job) => job.minWorkers,
  };

  if (sortOrder.columnId in getSortable) {
    const sortKey = getSortable[sortOrder.columnId];
    return data.sort((a, b) => {
      if (sortKey(a) < sortKey(b)) {
        return sortOrder.direction === "desc" ? 1 : -1;
      }
      if (sortKey(a) > sortKey(b)) {
        return sortOrder.direction === "desc" ? -1 : 1;
      }
      return 0;
    });
  }
  return data;
}
