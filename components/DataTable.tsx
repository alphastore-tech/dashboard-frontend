interface Column {
  header: string;
  accessor: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, any>> {
  title: string;
  columns: Column[];
  data: T[];
}

export default function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
}: DataTableProps<T>) {
  /* 유틸: 값이 숫자 or % → 기본 오른쪽 정렬 */
  const defaultAlign = (val: any) =>
    typeof val === "number" || /^-?\\d[\\d,]*(\\.\\d+)?%?$/.test(String(val))
      ? "right"
      : "left";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="px-6 py-3 bg-header text-base font-semibold text-gray-800">
        {title}
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-t border-border text-[11px] uppercase tracking-wider text-gray-500">
            {columns.map(({ header, align = "left" }) => (
              <th key={header} className={`px-6 py-2 text-${align}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-border">
              {columns.map(({ accessor, align }, i) => {
                const val = row[accessor];
                const finalAlign = align ?? defaultAlign(val);
                return (
                  <td
                    key={i}
                    className={`px-6 py-2 whitespace-nowrap text-${finalAlign}`}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
