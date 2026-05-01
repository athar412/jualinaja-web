type Status = "PENDING_REVIEW" | "AWAITING_PAYMENT" | "LIVE" | "REJECTED" | "SOLD";

const CONFIG: Record<Status, { label: string; dot: string; text: string }> = {
  PENDING_REVIEW:   { label: "Menunggu Review", dot: "bg-amber-400",   text: "text-amber-700"   },
  AWAITING_PAYMENT: { label: "Menunggu Bayar",  dot: "bg-blue-500",    text: "text-blue-700"    },
  LIVE:             { label: "Aktif / Tayang",  dot: "bg-emerald-500", text: "text-emerald-700" },
  REJECTED:         { label: "Ditolak",         dot: "bg-red-500",     text: "text-red-700"     },
  SOLD:             { label: "Terjual",         dot: "bg-neutral-400", text: "text-neutral-600" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${cfg.text}`}>
      <span className={`status-dot ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
