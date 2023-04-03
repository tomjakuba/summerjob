export default function AccessDeniedPage() {
  return (
    <div className="container mt-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-auto pe-4 me-4 error-code-border">
          <span className="fs-2">Přístup odepřen</span>
        </div>
        <div className="col-auto align-middle">
          <span>Nemáte přístup na tuto stránku.</span>
        </div>
      </div>
    </div>
  );
}
