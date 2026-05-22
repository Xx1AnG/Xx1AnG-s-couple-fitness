type MetricCardProps = {
  label: string;
  value: number;
  suffix: string;
};

export function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-stone-950">
        {value}
        <span className="ml-1 text-base font-medium text-stone-500">
          {suffix}
        </span>
      </p>
    </section>
  );
}
