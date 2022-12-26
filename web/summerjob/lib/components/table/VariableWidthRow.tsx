interface RowProps {
  data: any[];
  widths: number[];
}

export function VariableWidthRow({ data, widths }: RowProps) {
  return (
    <div className="row">
      {data.map((field, index) => {
        return (
          <div
            className={`col-${widths[index]} align-items-xl-center text-truncate`}
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
