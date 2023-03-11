"use client";
import PageHeader from "lib/components/page-header/PageHeader";
import { LoadingRow } from "lib/components/table/LoadingRow";
import { SimpleRow } from "lib/components/table/SimpleRow";
import { useAPIWorkers } from "lib/fetcher/worker";
import Link from "next/link";
import ErrorPage from "./error";

const _columns = [
  "Jméno",
  "Příjmení",
  "Telefonní číslo",
  "E-mail",
  "Silák",
  "Má auto",
  "Akce",
];

export default function WorkersPage() {
  const { data, error, isLoading } = useAPIWorkers();

  if (error && !data) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader title="Pracanti">
        <button className="btn btn-warning" type="button">
          <i className="far fa-user"></i>
          <span>Přidat pracanta</span>
        </button>
        <button className="btn btn-primary" type="button">
          <i className="fas fa-print"></i>
          <span>Tisknout</span>
        </button>
      </PageHeader>

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
                      data !== undefined &&
                      data.map((worker) => (
                        <SimpleRow
                          key={worker.id}
                          data={[
                            worker.firstName,
                            worker.lastName,
                            worker.phone,
                            worker.email,
                            worker.isStrong ? "Ano" : "Ne",
                            worker.cars.length > 0 ? "Ano" : "Ne",
                            <Link
                              key={worker.id}
                              href={`/workers/${worker.id}`}
                            >
                              Upravit
                            </Link>,
                          ]}
                        />
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-sm-12 col-lg-3">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Filtrovat</h5>
                <hr />
                <label className="form-label" htmlFor="worker-name">
                  Jméno:
                </label>
                <input
                  type="text"
                  placeholder="Jméno, příjmení"
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
