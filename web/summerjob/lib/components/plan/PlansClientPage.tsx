"use client";
import ErrorPage from "lib/components/error-page/error";
import PageHeader from "lib/components/page-header/PageHeader";
import { useAPIPlans } from "lib/fetcher/plan";
import { formatDateLong } from "lib/helpers/helpers";
import { deserializePlans } from "lib/types/plan";
import Link from "next/link";

interface PlansClientPageProps {
  initialData: string;
}

export default function PlansClientPage({ initialData }: PlansClientPageProps) {
  const initialDataParsed = deserializePlans(initialData);
  const { data, error, isLoading } = useAPIPlans({
    fallbackData: initialDataParsed,
  });

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
            {isLoading && !data && <center>Načítání...</center>}
            {data?.map((plan) => (
              <Link
                className="list-group-item list-group-item-action"
                href={`/plans/${plan.id}`}
                key={plan.id}
              >
                <div className="row">
                  <div className="col">
                    <h5>{formatDateLong(plan.day, true)}</h5>
                    <p>{plan.jobs.length} jobů</p>
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
