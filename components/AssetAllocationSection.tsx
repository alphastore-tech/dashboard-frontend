import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

  return (
    <section
      className={`rounded-xl border border-border bg-white p-6 space-y-4 shadow-sm dark:bg-slate-800 dark:border-slate-700 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>

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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
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
