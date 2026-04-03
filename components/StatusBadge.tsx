type StatusConfig = {
  label: string;
  className: string;
};

const statusConfig: Record<string, StatusConfig> = {
  available: {
    label: "Tilgjengelig",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  booked: {
    label: "Utlånt",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  under_maintenance: {
    label: "Under vedlikehold",
    className: "bg-[#374151]/50 text-[#9CA3AF] border border-[#374151]",
  },
  bedrift: {
    label: "Bedrift",
    className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  },
  etat: {
    label: "Etat",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
  // loan request statuses
  pending: {
    label: "Venter",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  approved: {
    label: "Godkjent",
    className:
      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  rejected: {
    label: "Avvist",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  returned: {
    label: "Returnert",
    className: "bg-[#374151]/50 text-[#9CA3AF] border border-[#374151]",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
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
