type Status = "active" | "under_maintenance" | "retired";

const statusConfig: Record<
  Status,
  { label: string; className: string }
> = {
  active: {
    label: "Aktiv",
    className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  under_maintenance: {
    label: "Under vedlikehold",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  retired: {
    label: "Pensjonert",
    className: "bg-[#374151]/50 text-[#9CA3AF] border border-[#374151]",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] ?? {
    label: status,
    className: "bg-[#374151]/50 text-[#9CA3AF] border border-[#374151]",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
