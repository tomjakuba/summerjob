export default function PageHeader({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="mb-3 mt-3">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <h2>{title}</h2>
          </div>
          <div className="w-100 d-md-none"></div>
          <div className="col-auto d-flex align-items-center flex-wrap justify-content-md-end plan-controlbar gap-2">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
