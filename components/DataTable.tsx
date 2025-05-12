interface Column {
  header: string;
  accessor: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, any>> {
  title: string;
  columns: Column[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  error?: Error | null;
}

export default function DataTable<T extends Record<string, any>>({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  error = null,
}: DataTableProps<T>) {
  const defaultAlign = (v: any) =>
    typeof v === "number" || /^-?\d[\d,]*(\.\d+)?%?$/.test(String(v))
      ? "right"
      : "left";

  /** 메시지 한 줄을 그리는 헬퍼 */
  const renderRowMessage = (msg: string) => (
    <tr className="border-t border-border">
      <td
        colSpan={columns.length}
        className="px-6 py-10 text-center text-gray-500"
      >
        {msg}
      </td>
    </tr>
  );

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
          {error
            ? renderRowMessage(`오류가 발생했습니다: ${error.message}`)
            : loading
            ? renderRowMessage("실시간 잔고 업데이트 중...")
            : data.length === 0
            ? renderRowMessage(emptyMessage)
            : data.map((row, idx) => (
                <tr key={idx} className="border-t border-border">
                  {columns.map(({ accessor, align }, i) => {
                    const v = row[accessor];
                    const finalAlign = align ?? defaultAlign(v);

                    // 색상 결정: plAmount, plPercent에 한해 음수면 파랑, 양수면 빨강
                    let textColor = "";
                    if (accessor === "plAmount" || accessor === "plPercent") {
                      // 숫자 추출 (문자열에 +, -, %, , 등 있을 수 있음)
                      let num =
                        typeof v === "number"
                          ? v
                          : Number(String(v).replace(/[^-0-9.]/g, ""));
                      if (!isNaN(num)) {
                        if (num < 0) textColor = "text-blue-700";
                        else if (num > 0) textColor = "text-red-700";
                      }
                    }

                    return (
                      <td
                        key={i}
                        className={`px-6 py-2 whitespace-nowrap text-${finalAlign} ${textColor}`}
                      >
                        {v}
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
