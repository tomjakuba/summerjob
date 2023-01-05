"use client";
import { LoadingRow } from "lib/components/table/LoadingRow";
import { SimpleRow } from "lib/components/table/SimpleRow";
import { useData } from "lib/fetcher/fetcher";
import Link from "next/link";
import type { Worker } from "../../../lib/prisma/client";
import ErrorPage from "./error";

const _columns = [
  "Jméno",
  "Příjmení",
  "Telefonní číslo",
  "E-mail",
  "Alergie",
  "Schopnosti",
  "Akce",
];

export default function WorkersPage() {
  const { data, error, isLoading } = useData<Worker[], Error>("/api/users");
  if (error) {
    return <ErrorPage error={error} />;
  }
  const workers = data as Worker[];
  return (
    <>
      <section className="mb-3 mt-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h2>Pracanti</h2>
            </div>
            <div className="col-auto d-xl-flex justify-content-xl-end align-items-xl-center plan-controlbar">
              <button
                className="btn btn-warning d-xl-flex align-items-xl-center"
                type="button"
              >
                <i className="far fa-user"></i>
                <span>Přidat pracanta</span>
              </button>
              <button
                className="btn btn-primary d-xl-flex align-items-xl-center"
                type="button"
              >
                <i className="fas fa-print"></i>
                <span>Tisknout</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container-fluid">
          <div className="row gx-3">
            <div className="col-sm-12 col-lg-9">
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
                    {isLoading && <LoadingRow colspan={_columns.length} />}
                    {!isLoading &&
                      workers.map((worker) => (
                        <SimpleRow
                          key={worker.id}
                          {...{
                            data: [
                              ...Object.values(worker).slice(1),
                              "-", // Alergie
                              "-", // Schopnosti
                              <Link href={`/workers/${worker.id}`}>
                                Upravit
                              </Link>,
                            ],
                          }}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-sm-12 col-lg-3 offset-xl-0">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Filtrovat</h5>
                <hr />
                <label className="form-label" htmlFor="worker-name">
                  Jméno:
                </label>
                <input
                  type="text"
                  placeholder="Jméno a příjmení"
                  name="worker-name"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
