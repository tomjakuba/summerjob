"use client";

import ErrorPage from "lib/components/error-page/error";

export default function ErrorHandler({ error }: { error: Error }) {
  return <ErrorPage error={error} />;
}
