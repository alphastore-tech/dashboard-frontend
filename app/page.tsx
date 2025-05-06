import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";

const stats = [
  { label: "Balance", value: "50,000" },
  { label: "Return", value: "8.5%" },
  { label: "Sharpe Ratio", value: "1.25" },
  { label: "MDD", value: "-10.2%" },
  { label: "Volatility", value: "12.8%" },
];

const currentPositions = [
  { type: "Futures", symbol: "ES", qty: 3, avgPrice: "4,200.50", pl: "5.4%" },
  { type: "Stock", symbol: "AAPL", qty: 10, avgPrice: "150.75", pl: "-2.3%" },
  { type: "Futures", symbol: "CL", qty: 2, avgPrice: "70.30", pl: "1.8%" },
  { type: "Stock", symbol: "GOOGL", qty: 5, avgPrice: "2,800.10", pl: "7.5%" },
];

const orders = [
  {
    order: 1004,
    status: "Filled",
    symbol: "AAPL",
    orderPrice: "150.5",
    filledPrice: "150.75",
    qty: 10,
    date: "01/04/2024",
  },
  {
    order: 1003,
    status: "Canceled",
    symbol: "ES",
    orderPrice: "4,150.00",
    filledPrice: "3",
    qty: 3,
    date: "01/03/2024",
  },
  {
    order: 1002,
    status: "Filled",
    symbol: "CL",
    orderPrice: "70.00",
    filledPrice: "70.30",
    qty: 2,
    date: "01/02/2024",
  },
];

export default function Page() {
  return (
    <main className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Strategy 1</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <DataTable
        title="Current Positions"
        columns={[
          { header: "Type", accessor: "type" },
          { header: "Symbol", accessor: "symbol" },
          { header: "Qty", accessor: "qty" },
          { header: "Avg Price", accessor: "avgPrice" },
          { header: "P/L (%)", accessor: "pl" },
        ]}
        data={currentPositions}
      />

      <DataTable
        title="Order History"
        columns={[
          { header: "Order #", accessor: "order" },
          { header: "Status", accessor: "status" },
          { header: "Symbol", accessor: "symbol" },
          { header: "Order Price", accessor: "orderPrice" },
          { header: "Filled Price", accessor: "filledPrice" },
          { header: "Qty", accessor: "qty" },
          { header: "Date", accessor: "date" },
        ]}
        data={orders}
      />
    </main>
  );
}
