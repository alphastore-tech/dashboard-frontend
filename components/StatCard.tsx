interface StatCardProps {
  label: string;
  value: string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-red px-8 py-5">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="mt-1 text-4xl font-extrabold leading-tight tracking-tight">
        {value}
      </span>
    </div>
  );
}
