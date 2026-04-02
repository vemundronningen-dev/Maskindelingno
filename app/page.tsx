import { db } from "@/lib/db";
import { machines, maintenance_logs } from "@/lib/schema";
import { eq, lt, and, isNotNull } from "drizzle-orm";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const allMachines = await db.select().from(machines);
  const total = allMachines.length;
  const active = allMachines.filter((m) => m.status === "active").length;
  const underMaintenance = allMachines.filter(
    (m) => m.status === "under_maintenance"
  ).length;

  const today = new Date().toISOString().split("T")[0];

  // Get overdue maintenance logs (next_due_date < today)
  const overdueLogs = await db
    .select({
      log: maintenance_logs,
      machine: machines,
    })
    .from(maintenance_logs)
    .innerJoin(machines, eq(maintenance_logs.machine_id, machines.id))
    .where(
      and(
        isNotNull(maintenance_logs.next_due_date),
        lt(maintenance_logs.next_due_date, today)
      )
    );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-[#6B7280] text-sm mt-1">Oversikt over maskinpark</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Totalt maskiner
          </p>
          <p className="text-3xl font-bold text-white mt-2">{total}</p>
        </div>
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Aktive
          </p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{active}</p>
        </div>
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Under vedlikehold
          </p>
          <p className="text-3xl font-bold text-amber-400 mt-2">
            {underMaintenance}
          </p>
        </div>
      </div>

      {/* Overdue alerts */}
      {overdueLogs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
            Forfalt vedlikehold ({overdueLogs.length})
          </h3>
          <div className="space-y-3">
            {overdueLogs.map(({ log, machine }) => (
              <Link
                key={log.id}
                href={`/maskiner/${machine.id}`}
                className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg px-5 py-4 hover:border-red-500/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {machine.name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{log.title}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={machine.status} />
                  <p className="text-xs text-red-400 mt-1">
                    Forfalt: {log.next_due_date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {overdueLogs.length === 0 && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-5 text-center">
          <p className="text-emerald-400 text-sm">
            Ingen forfalt vedlikehold. Alt er i orden!
          </p>
        </div>
      )}
    </div>
  );
}
