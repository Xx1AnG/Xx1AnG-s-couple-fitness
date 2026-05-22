import { clsx } from "clsx";

type NoticeProps = {
  message?: string;
  error?: string;
};

export function Notice({ message, error }: NoticeProps) {
  if (!message && !error) {
    return null;
  }

  return (
    <div
      className={clsx(
        "rounded-lg border px-3 py-2 text-sm",
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
      role="status"
    >
      {error || message}
    </div>
  );
}
