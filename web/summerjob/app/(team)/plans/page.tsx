"use client";
import ErrorPage from "lib/components/error-page/error";
import PageHeader from "lib/components/page-header/PageHeader";
import { useAPIPlans } from "lib/fetcher/fetcher";
import { formatDateLong } from "lib/helpers/helpers";
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

export default function PlanPage() {
  const { data, error, isLoading } = useAPIPlans();

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <>
      <PageHeader title="Seznam plánů" isFluid={false}>
        <button className="btn btn-warning" type="button">
          <i className="far fa-calendar-plus"></i>
          <span>Nový plán</span>
        </button>
      </PageHeader>

      <section>
        <div className="container">
          <div className="list-group">
            {isLoading && <center>Načítání...</center>}
            {data?.map((plan) => (
              <Link
                className="list-group-item list-group-item-action"
                href={`/plans/${plan.id}`}
                key={plan.id}
              >
                <div className="row">
                  <div className="col">
                    <h5>{formatDateLong(plan.day)}</h5>
                    <p>{plan.jobs.length} jobů</p>
                    <small className="text-muted">
                      Poslední úprava dnes 8:11
                    </small>
                  </div>
                  <div className="col d-flex justify-content-end align-items-center gap-3">
                    <i className="fas fa-chevron-right"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
