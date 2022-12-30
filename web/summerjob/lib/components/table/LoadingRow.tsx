interface RowProps {
  colspan: number;
}

export function LoadingRow({ colspan }: RowProps) {
  return (
    <tr>
      <td colSpan={colspan} className="text-truncate text-center">
        Načítání...
      </td>
    </tr>
  );
}
