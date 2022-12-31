"use client";
import type { Worker } from "../../../lib/prisma/client";

export default function EditWorker({ worker }: { worker: Worker }) {
  return (
    <>
      <div className="row mb-3">
        <div className="col">
          <h2>
            {worker.firstName} {worker.lastName}
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form>
            <label className="form-label fw-bold" htmlFor="name">
              Jméno
            </label>
            <input
              id="name"
              className="form-control p-0 mb-4 fs-5"
              type="text"
              defaultValue={worker.firstName}
              placeholder="Jméno"
            />
            <label className="form-label fw-bold" htmlFor="surname">
              Příjmení
            </label>
            <input
              id="surname"
              className="form-control p-0 mb-4 fs-5"
              type="text"
              defaultValue={worker.lastName}
              placeholder="Příjmení"
            />
            <label className="form-label fw-bold" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              className="form-control p-0 mb-4 fs-5"
              type="email"
              defaultValue={worker.email}
            />
            <label className="form-label d-block fw-bold" htmlFor="email">
              Alergie
            </label>
            <div className="form-check-inline mb-2">
              <div className="d-inline-block me-3">
                <input id="alergie_pyl" className="btn-check" type="checkbox" />
                <label
                  className="form-label btn-light btn p-2"
                  htmlFor="alergie_pyl"
                >
                  Pyl
                </label>
              </div>
              <div className="d-inline-block me-3">
                <input
                  id="alergie_prach"
                  className="btn-check"
                  type="checkbox"
                />
                <label
                  className="form-label btn-light btn p-2"
                  htmlFor="alergie_prach"
                >
                  Prach
                </label>
              </div>
              <div className="d-inline-block me-3">
                <input
                  id="alergie_zvirata"
                  className="btn-check"
                  type="checkbox"
                />
                <label
                  className="form-label btn-light btn p-2"
                  htmlFor="alergie_zvirata"
                >
                  Zvířata
                </label>
              </div>
            </div>
            <label className="form-label d-block fw-bold" htmlFor="email">
              Auto
            </label>
            <select className="form-select p-1">
              <option value="none" selected>
                Žádné
              </option>
              <optgroup label="Auta bez majitele">
                <option value="rapid">Škoda Rapid (2A7 7885)</option>
                <option value="mondeo">Ford Mondeo (9B7 7110)</option>
              </optgroup>
            </select>
          </form>
        </div>
        <div className="w-100 d-lg-none mt-3"></div>
        <div className="col-sm-auto col-lg-3 d-flex flex-column">
          <img className="img-fluid" src="/profile.webp" />
          <button className="btn btn-warning ms-auto mt-2" type="button">
            Změnit obrázek
          </button>
        </div>
      </div>
    </>
  );
}
