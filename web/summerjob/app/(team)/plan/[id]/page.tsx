"use client";
import ErrorPage from "lib/components/error-page/error";
import PageHeader from "lib/components/page-header/PageHeader";
import { ExpandableRow } from "lib/components/table/ExpandableRow";
import { LoadingRow } from "lib/components/table/LoadingRow";
import { SimpleRow } from "lib/components/table/SimpleRow";
import { useData } from "lib/fetcher/fetcher";
import { PlanComplete } from "lib/types/plan";
import Link from "next/link";

const _columns = [
  "Práce",
  "Pracovníci",
  "Kontaktní osoba",
  "Oblast",
  "Adresa",
  "Zajištění",
  "Akce",
];

type Params = {
  params: {
    id: string;
  };
};

export default function PlanPage({ params }: Params) {
  const { data, error, isLoading } = useData<PlanComplete, Error>(
    `/api/plans/${params.id}`
  );

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader title="Pondělí, 19. července">
        <button className="btn btn-warning" type="button">
          <i className="fas fa-briefcase"></i>
          <span>Přidat job</span>
        </button>
        <button className="btn btn-primary" type="button">
          <i className="fas fa-cog"></i>
          <span>Vygenerovat plán</span>
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
                      data.jobs.map((job) => (
                        <ExpandableRow
                          key={job.id}
                          data={[
                            job.proposedJob.name,
                            `${job.workers.length}/${job.proposedJob.maxWorkers}`,
                            "?",
                            job.proposedJob.area.name,
                            job.proposedJob.address,
                            "Zajištění",
                            <Link href={`/active-job/${job.id}`}>Upravit</Link>,
                          ]}
                        >
                          <>
                            <div className="ms-2">
                              <p>{job.privateDescription}</p>
                              <p>{job.publicDescription}</p>
                              <p>
                                <strong>Doprava:</strong>{" "}
                                {job.ride ? "Ano" : "Ne"}
                              </p>
                            </div>
                            <div className="table-responsive text-nowrap">
                              <table className="table table-hover">
                                <tbody>
                                  <tr>
                                    <td>
                                      Klára Rychlá
                                      <i className="fas fa-car ms-2"></i>
                                    </td>
                                    <td>775 884 784</td>
                                    <td>Řidič, Silák</td>
                                    <td>
                                      <a className="me-3" href="#">
                                        Odstranit
                                      </a>
                                      <a href="#">Přesunout</a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Marie Kubinčáková</td>
                                    <td>775 884 784</td>
                                    <td></td>
                                    <td>
                                      <a className="me-3" href="#">
                                        Odstranit
                                      </a>
                                      <a href="#">Přesunout</a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Marek Hrozný</td>
                                    <td>775 884 784</td>
                                    <td>Silák</td>
                                    <td>
                                      <a className="me-3" href="#">
                                        Odstranit
                                      </a>
                                      <a href="#">Přesunout</a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </>
                        </ExpandableRow>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-sm-12 col-lg-3">
              <div className="vstack smj-search-stack smj-shadow rounded-3">
                <h5>Filtrovat Joby</h5>
                <hr />
                <label className="form-label" htmlFor="job-filter">
                  Job:
                </label>
                <input
                  type="text"
                  placeholder="Název, adresa ..."
                  name="job-filter"
                />
                <label className="form-label mt-4" htmlFor="worker-filter">
                  Pracant:
                </label>
                <input
                  type="text"
                  placeholder="Jméno, příjmení"
                  name="worker-filter"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
