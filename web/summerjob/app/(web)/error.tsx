"use client";

import ErrorPage from "lib/components/error-page/ErrorPage";

export default function ErrorHandler({
  error,
}: {
  error: Error;
  reset?: () => void;
}) {
  return <ErrorPage error={error} />;
}
