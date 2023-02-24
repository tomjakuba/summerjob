"use client";
import { useAPICars } from "lib/fetcher/car";
import { CarComplete, deserializeCars } from "lib/types/car";
import { useState } from "react";
import PageHeader from "../page-header/PageHeader";
import { CarsFilters } from "./CarsFilters";
import { CarsTable } from "./CarsTable";

interface CarsClientPageProps {
  initialData: string;
}

export default function CarsClientPage({ initialData }: CarsClientPageProps) {
  const initialCars = deserializeCars(initialData);
  const { data, error, isLoading } = useAPICars({ fallbackData: initialCars });
  const [filter, setFilter] = useState("");

  const filterCars = (cars: CarComplete[]) => {
    return cars.filter((car) => {
      const name = car.name.toLowerCase();
      const owner =
        car.owner.firstName.toLowerCase() + car.owner.lastName.toLowerCase();
      return name.includes(filter) || owner.includes(filter);
    });
  };

  return (
    <>
      <PageHeader title={"Seznam vozidel"}>
        <button className="btn btn-warning" type="button">
          <i className="fas fa-car"></i>
          <span>Nové auto</span>
        </button>
      </PageHeader>

      <section>
        <div className="container-fluid">
          <div className="row gx-3">
            <div className="col">
              <CarsFilters search={filter} onSearchChanged={setFilter} />
            </div>
          </div>
          <div className="row gx-3">
            <div className="col-sm-12 col-lg-12">
              <CarsTable data={filterCars(data!)}></CarsTable>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
