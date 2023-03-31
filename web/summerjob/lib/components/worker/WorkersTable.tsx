import { WorkerComplete } from "lib/types/worker";
import Link from "next/link";
import { MessageRow } from "../table/MessageRow";
import { SimpleRow } from "../table/SimpleRow";

interface WorkersTableProps {
  workers: WorkerComplete[];
}

export default function WorkersTable({ workers }: WorkersTableProps) {
  return (
    <div className="table-responsive text-nowrap mb-2 smj-shadow rounded-3">
      <table className="table table-hover mb-0">
        <thead className="smj-table-header">
          <tr>
            {_columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody className="smj-table-body mb-0">
          {workers.length === 0 && (
            <MessageRow message="Žádní pracanti" colspan={_columns.length} />
          )}
          {workers.map((worker) => (
            <SimpleRow key={worker.id} data={formatWorkerRow(worker)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatWorkerRow(worker: WorkerComplete) {
  return [
    worker.firstName,
    worker.lastName,
    worker.phone,
    worker.email,
    <>
      {worker.cars.length > 0 && (
        <i className="fas fa-car me-2" title={"Má auto"} />
      )}
      {worker.isStrong && <i className="fas fa-dumbbell" title={"Silák"} />}
    </>,
    <span
      key={`actions-${worker.id}`}
      className="d-flex align-items-center gap-3"
    >
      <Link
        href={`/workers/${worker.id}`}
        onClick={(e) => e.stopPropagation()}
        className="smj-action-edit"
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>
    </span>,
  ];
}

const _columns = [
  "Jméno",
  "Příjmení",
  "Telefonní číslo",
  "E-mail",
  "Vlastnosti",
  "Akce",
];
