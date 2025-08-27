import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';

interface AllocationData {
  name: string;
  value: number;
}

type ViewModeGroup1 = 'stock' | 'sector';
type ViewModeGroup2 = 'holdings' | 'currency';

interface AssetAllocationSectionProps<T extends 'group1' | 'group2' = 'group1'> {
  data: AllocationData[];
  title?: string;
  className?: string;
  viewMode?: T extends 'group1' ? ViewModeGroup1 : ViewModeGroup2;
  onViewModeChange?: (mode: T extends 'group1' ? ViewModeGroup1 : ViewModeGroup2) => void;
  showViewToggle?: boolean;
  viewModeGroup?: T;
}

const PIE_COLORS = [
  '#1e40af',
  '#dc2626',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#0891b2',
  '#65a30d',
  '#ea580c',
  '#4338ca',
];

const AssetAllocationSection = <T extends 'group1' | 'group2' = 'group1'>({
  data,
  title = 'Asset Allocation',
  className = '',
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  viewModeGroup = 'group1' as T,
}: AssetAllocationSectionProps<T>) => {
  const handleViewModeChange = (mode: T extends 'group1' ? ViewModeGroup1 : ViewModeGroup2) => {
    onViewModeChange?.(mode);
  };

  const getViewModeOptions = () => {
    if (viewModeGroup === 'group1') {
      return [
        { id: 'stock', label: 'Stock' },
        { id: 'sector', label: 'Sector' },
      ] as const;
    } else {
      return [
        { id: 'holdings', label: 'Holdings' },
        { id: 'currency', label: 'Currency' },
      ] as const;
    }
  };

  const viewModeOptions = getViewModeOptions();

  const RADIAN = Math.PI / 180;
  const renderInsidePercent = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (percent < 0.045) return null; // 너무 작은 조각은 라벨 생략 (겹침 방지)
    const r = innerRadius + (outerRadius - innerRadius) * 0.55; // 조각 안쪽에 배치
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill="#ffffff"
        style={{ pointerEvents: 'none' }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <section
      className={`rounded-xl border border-border bg-white p-6 space-y-4 shadow-sm dark:bg-slate-800 dark:border-slate-700 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          <span className="sm:hidden">Allocation</span>
          <span className="hidden sm:inline">{title}</span>
        </h2>
        {showViewToggle && viewMode && onViewModeChange && (
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {viewModeOptions.map((btn) => (
              <button
                key={btn.id}
                type="button"
                className={`px-3 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                  viewMode === btn.id ? 'bg-gray-200 font-semibold' : 'bg-white'
                }`}
                onClick={() => handleViewModeChange(btn.id as any)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              label={renderInsidePercent} // ⬅️ 조각 내부 % 라벨
              labelLine={false} // ⬅️ 라벨 가이드 라인 숨김
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default AssetAllocationSection;
