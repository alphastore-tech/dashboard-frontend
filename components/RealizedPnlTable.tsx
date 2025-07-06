import { useState, useEffect } from 'react';
import Pagination from './Pagination';

interface Column {
  key: string;
  label: string;
  align: 'left' | 'right';
}

interface RealizedPnlTableProps {
  data: any[];
  columns: Column[];
  view: 'Daily' | 'Monthly';
  setView: (view: 'Daily' | 'Monthly') => void;
}

export default function RealizedPnlTable({ data, columns, view, setView }: RealizedPnlTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  /* 🔑 view가 바뀔 때마다 page를 1로 리셋 */
  useEffect(() => {
    setPage(1);
  }, [view]);

  const paged = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {view === 'Daily' ? 'Daily Details' : 'Monthly Details'}
        </h2>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {[
            { id: 'Daily', label: 'Daily' },
            { id: 'Monthly', label: 'Monthly' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`px-3 py-1 text-sm border first:rounded-l-md last:rounded-r-md focus:outline-none ${
                view === btn.id ? 'bg-gray-200 font-semibold' : 'bg-white'
              }`}
              onClick={() => setView(btn.id as 'Daily' | 'Monthly')}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm tracking-tight">
          <thead className="border-b text-slate-500">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2 ${c.align === 'left' ? 'text-left' : 'text-right'}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 ${col.align === 'left' ? 'text-left' : 'text-right'}`}
                  >
                    {renderCell(col.key, row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-10">
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </section>
  );
}
function renderCell(key: string, value: number) {
  if (key === 'totalPnl' || key === 'stockPnl' || key === 'futurePnl' || key === 'cash_flow') {
    const cls = value > 0 ? 'text-red-500' : value < 0 ? 'text-blue-600' : 'text-gray-600';
    const sign = value >= 0 ? '+' : '';
    return <span className={cls}>{`${sign}${value.toLocaleString()}`}</span>;
  }
  if (key === 'cash_flow') return value.toLocaleString();
  return value;
}
