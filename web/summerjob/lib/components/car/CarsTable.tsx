import { CarComplete } from "lib/types/car";
import Link from "next/link";
import { SimpleRow } from "../table/SimpleRow";

const _columns = [
  "Název",
  "Majitel",
  "Místa",
  "Najeto km",
  "Proplaceno",
  "Akce",
];

interface CarTableProps {
  data?: CarComplete[];
}

export function CarsTable({ data }: CarTableProps) {
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
          {data !== undefined &&
            data.map((car) => (
              <SimpleRow
                key={car.id}
                {...{
                  data: formatCarRow(car),
                }}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCarRow(car: CarComplete) {
  const drivenKm = car.odometers[0].end - car.odometers[0].start;
  return [
    car.name,
    `${car.owner.firstName} ${car.owner.lastName}`,
    car.seats,
    drivenKm,
    car.odometers[0].reimbursed >= drivenKm ? "Ano" : "Ne",
    <Link key={car.id} href={`/cars/${car.id}`}>
      Upravit
    </Link>,
  ];
}
