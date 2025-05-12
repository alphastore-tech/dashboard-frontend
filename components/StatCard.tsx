interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
  /** 색상 결정 로직
   *  1) % 포함?  →  수익률
   *  2) +  →  빨강  /  –  →  파랑
   *  3) % 없으면 기본(검정)
   */
  const textColor = (() => {
    if (!value.includes("%")) return "text-gray-900"; // 기본
    if (value.trim().startsWith("-")) return "text-blue-700"; // 음수
    if (value.trim().startsWith("+")) return "text-red-700"; // 양수(또는 +표시)
    return "text-gray-900"; // 양수(또는 +표시)
  })();

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-white px-8 py-5">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span
        className={`mt-1 text-xl font-medium leading-tight tracking-tight ${textColor}`}
      >
        {value}
      </span>
    </div>
  );
}
