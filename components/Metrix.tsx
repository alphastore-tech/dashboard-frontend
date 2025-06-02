// components/Metric.tsx
interface MetricProps {
  label: string;
  value: string;
}
export default function Metric({ label, value }: MetricProps) {
  return (
    <p className="flex justify-end text-sm">
      <span className="mr-1 shrink-0 text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </p>
  );
}
