type Params = {
  params: {
    id: string;
  };
};

export default function EditWorkerPage({ params }: Params) {
  return (
    <>
      <section className="mb-3 mt-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h2>Upravit pracanta {params.id}</h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
