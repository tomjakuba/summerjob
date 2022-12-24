interface RowProps {
  data: any[];
}

export function SimpleRow({ data }: RowProps) {
  return (
    <div className="row">
      {data.map((field, index) => {
        return (
          <div
            className="col-2 align-items-xl-center text-truncate"
            key={index}
            title={field}
          >
            {field}
          </div>
        );
      })}
    </div>
  );
}
