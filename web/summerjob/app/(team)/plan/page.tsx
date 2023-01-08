import PageHeader from "lib/components/page-header/PageHeader";
import { LoadingRow } from "lib/components/table/LoadingRow";

const _columns = [
  "Práce",
  "Pracovníci",
  "Kontaktní osoba",
  "Oblast",
  "Adresa",
  "Zajištění",
  "Akce",
];

export default function PlanPage() {
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
                    <LoadingRow colspan={_columns.length} />
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
