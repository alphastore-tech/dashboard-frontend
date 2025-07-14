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
  loading: boolean;
  error: Error | null;
}

export default function RealizedPnlTable({ data, columns, view, setView, loading, error }: RealizedPnlTableProps) {
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
          {view === 'Daily' ? 'Daily Details' : 'Monthly Details (Mock)'}
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

      {/* 에러 상태 */}
      {error && (
        <div className="rounded-xl bg-red-50 p-6 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                데이터를 불러오는 중 오류가 발생했습니다: {error.message}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-600">데이터를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 데이터가 없는 경우 */}
      {!loading && !error && data.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">데이터가 없습니다</h3>
            <p className="mt-1 text-sm text-slate-500">
              {view === 'Daily' ? '일별' : '월별'} 데이터가 없습니다.
            </p>
          </div>
        </div>
      )}

      {/* 테이블 - 로딩 중이 아니고 에러가 없고 데이터가 있을 때만 표시 */}
      {!loading && !error && data.length > 0 && (
        <>
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
        </>
      )}
    </section>
  );
}


function renderCell(key: string, value: number) {
  if (key === 'totalPnl' || key === 'stockPnl' || key === 'futurePnl' || key === 'cashFlow') {
    const cls = value > 0 ? 'text-red-500' : value < 0 ? 'text-blue-600' : 'text-gray-600';
    const sign = value >= 0 ? '+' : '';
    return <span className={cls}>{`${sign}${value?.toLocaleString()}`}</span>;
  }
  if (key === 'cashFlow') return value.toLocaleString();
  return value;
}
