"use client";
import { CarComplete } from "lib/types/car";
import Link from "next/link";
import { useState } from "react";
import { Modal, ModalSize } from "../modal/Modal";
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
  const drivenKm = car.odometer.end - car.odometer.start;
  return [
    car.name,
    `${car.owner.firstName} ${car.owner.lastName}`,
    car.seats,
    drivenKm,
    car.odometer.reimbursed ? "Ano" : "Ne",
    <span
      key={car.id}
      className="d-flex align-items-center gap-3 smj-table-actions-cell"
    >
      <Link
        key={car.id}
        href={`/cars/${car.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>
      <i className="fas fa-trash-alt smj-action-delete" title="Smazat"></i>
    </span>,
  ];
}
