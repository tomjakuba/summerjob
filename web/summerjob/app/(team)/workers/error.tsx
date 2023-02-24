"use client";

import { ApiError } from "lib/data/api-error";
import { default as t } from "lib/localization/cs-cz";

export default function ErrorPage({ error }: { error: Error }) {
  const message = error.message;
  const isApiError = error instanceof ApiError;

  return (
    <section className="mb-3 mt-3">
      <div className="container">
        <div className="row">
          <div className="col">
            <h1>Došlo k chybě</h1>
            <p>
              Chyba:{" "}
              {error && (
                <span className="font-monospace">
                  {isApiError ? t(error.type) : message}
                </span>
              )}
            </p>
            {isApiError && (
              <p className="font-monospace text-muted">{message}</p>
            )}
            {!navigator.onLine && <p>Zkontrolujte připojení k internetu</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
