interface RowProps {
  data: any[];
}

export function SimpleRow({ data }: RowProps) {
  return (
    <tr>
      {data.map((field, index) => {
        return (
          <td
            className="text-truncate"
            key={index}
            title={typeof field === "string" ? field : undefined}
          >
            {field}
          </td>
        );
      })}
    </tr>
  );
}
