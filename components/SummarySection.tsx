interface SummaryData {
  totalAmount: number;
  totalPnlAmt: number;
  totalPnlPct: number;
  todayPnlAmt: number;
  todayPnlPct: number;
  amountChange?: number;
  amountChangePct?: number;
}

interface SummarySectionProps {
  data: SummaryData;
  title?: string;
  className?: string;
  currency?: 'KRW' | 'USD';
}

const fmtCur = (n: number, currency: 'KRW' | 'USD' = 'KRW') => {
  const symbol = currency === 'USD' ? '$' : '₩';
  return `${symbol}${n.toLocaleString()}`;
};
const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
const color = (n: number) => (n >= 0 ? 'text-rose-600' : 'text-blue-600');

const SummarySection = ({
  data,
  title = 'Summary',
  className = '',
  currency = 'KRW',
}: SummarySectionProps) => {
  return (
    <section
      className={`rounded-xl border border-border bg-white p-6 space-y-6 shadow-sm dark:bg-slate-800 dark:border-slate-700 ${className}`}
    >
      <h2 className="text-xl font-semibold">{title}</h2>

      {/* Total Amount */}
      <div>
        <p className="text-sm text-slate-500">Total Amount</p>
        <p className="mt-1 text-4xl font-bold">{fmtCur(data.totalAmount, currency)}</p>
        <div className="flex gap-4 mt-2 text-sm">
          <span className={`${color(data.totalPnlPct)} font-medium`}>
            {fmtPct(data.totalPnlPct)}
          </span>
          <span className={`${color(data.totalPnlAmt)} font-medium`}>
            +{fmtCur(data.totalPnlAmt, currency)}
          </span>
        </div>
      </div>

      {/* Today + Total PNL grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today PNL */}
        <div>
          <p className="text-sm text-slate-500">Today PNL</p>
          <p className={`mt-1 text-xl sm:text-2xl font-bold ${color(data.todayPnlAmt)}`}>
            {fmtCur(data.todayPnlAmt, currency)}
          </p>
          <p className={`text-sm ${color(data.todayPnlPct)}`}>{fmtPct(data.todayPnlPct)}</p>
        </div>

        {/* Total PNL */}
        <div>
          <p className="text-sm text-slate-500">Total PNL</p>
          <p className={`mt-1 text-xl sm:text-2xl font-bold ${color(data.totalPnlAmt)}`}>
            {fmtCur(data.totalPnlAmt, currency)}
          </p>
          <p className={`text-sm ${color(data.totalPnlPct)}`}>{fmtPct(data.totalPnlPct)}</p>
        </div>
      </div>
    </section>
  );
};

export default SummarySection;
