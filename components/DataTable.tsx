interface Column {
  header: string;
  accessor: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, any>> {
  title: string;
  columns: Column[];
  data: T[];
  /** data가 빈 배열일 때 표시할 문구 (기본값: '데이터가 없습니다.') */
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  emptyMessage = "데이터가 없습니다.",
}: DataTableProps<T>) {
  /** 숫자·퍼센트면 기본 오른쪽 정렬 */
  const defaultAlign = (v: any) =>
    typeof v === "number" || /^-?\d[\d,]*(\.\d+)?%?$/.test(String(v))
      ? "right"
      : "left";

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {/* 제목 */}
      <div className="bg-header px-6 py-3 text-base font-semibold text-gray-800">
        {title}
      </div>

      <table className="w-full text-sm">
        {/* 헤더 */}
        <thead>
          <tr className="border-t border-border bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            {columns.map(({ header, align = "left" }) => (
              <th key={header} className={`px-6 py-2 text-${align}`}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        {/* 바디 */}
        <tbody>
          {data.length === 0 ? (
            /* 빈 상태: 헤더는 유지되고, 한 행으로 메시지 출력 */
            <tr className="border-t border-border">
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
