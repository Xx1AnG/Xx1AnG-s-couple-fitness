import { clsx } from "clsx";

type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={clsx(
        "rounded-lg border border-stone-200 bg-white/88 p-4 shadow-soft",
        className,
      )}
    >
      {children}
    </section>
  );
}
