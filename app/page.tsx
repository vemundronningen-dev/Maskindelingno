"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MachineCard from "@/components/MachineCard";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

type MachineWithRelations = {
  id: number;
  make: string;
  model: string;
  serial_number: string | null;
  type: string;
  status: string;
  owner_organization_id: number;
  project_id: number | null;
  responsible_name: string | null;
  responsible_phone: string | null;
  responsible_email: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: string | null;
  owner_org_name: string | null;
  project_name: string | null;
};

type OverdueMaintenance = {
  id: number;
  title: string;
  date: string;
  next_due_date: string | null;
  machine_name: string;
  machine_id: number;
};

type LoanRequestWithRelations = {
  id: number;
  machine_id: number;
  requester_organization_id: number;
  requester_name: string;
  requester_phone: string | null;
  requester_email: string | null;
  from_date: string;
  to_date: string;
  purpose: string | null;
  status: string;
  response_message: string | null;
  created_at: string | null;
  machine_name: string;
  requester_org_name: string;
  owner_org_name: string;
};

type RecentBooking = {
  id: number;
  from_date: string;
  to_date: string;
  machine_name: string;
  borrower_org_name: string;
};

type DashboardData = {
  totalMachines: number;
  available: number;
  booked: number;
  underMaintenance: number;
  availableThisWeek: MachineWithRelations[];
  overdueMaintenance: OverdueMaintenance[];
  pendingRequests: LoanRequestWithRelations[];
  recentBookings: RecentBooking[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError("Kunne ikke laste dashboard");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center text-[#6B7280] text-sm pt-16">Laster...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-400 text-sm pt-16">
        {error ?? "Noe gikk galt"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-[#6B7280] text-sm mt-1">Oversikt over maskinpark</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Totalt maskiner
          </p>
          <p className="text-3xl font-bold text-white mt-2">
            {data.totalMachines}
          </p>
        </div>
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Tilgjengelig
          </p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            {data.available}
          </p>
        </div>
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Utlånt
          </p>
          <p className="text-3xl font-bold text-amber-400 mt-2">
            {data.booked}
          </p>
        </div>
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5">
          <p className="text-[#6B7280] text-xs font-medium uppercase tracking-wider">
            Under vedlikehold
          </p>
          <p className="text-3xl font-bold text-[#9CA3AF] mt-2">
            {data.underMaintenance}
          </p>
        </div>
      </div>

      {/* Available this week */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">
          Tilgjengelig denne uken
        </h3>
        {data.availableThisWeek.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-5 text-center">
            <p className="text-emerald-400 text-sm">
              Ingen tilgjengelige maskiner denne uken
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.availableThisWeek.slice(0, 5).map((m) => (
              <MachineCard
                key={m.id}
                machine={m}
                onClick={() => router.push(`/maskiner/${m.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Overdue maintenance */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">
          Forfalt vedlikehold
        </h3>
        {data.overdueMaintenance.length === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-5 text-center">
            <p className="text-emerald-400 text-sm">
              Alt vedlikehold er à jour!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.overdueMaintenance.map((item) => (
              <Link
                key={item.id}
                href={`/maskiner/${item.machine_id}`}
                className="flex items-center justify-between bg-red-500/5 border border-red-500/20 rounded-lg px-5 py-4 hover:border-red-500/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {item.machine_name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-400">
                    Forfalt: {item.next_due_date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pending loan requests */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Ventende låneforespørsler
          </h3>
          <Link
            href="/utlaan"
            className="text-xs text-[#F59E0B] hover:underline"
          >
            Se alle →
          </Link>
        </div>
        {data.pendingRequests.length === 0 ? (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5 text-center">
            <p className="text-[#6B7280] text-sm">
              Ingen ventende forespørsler
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-[#161B27] border border-[#1E2330] rounded-lg px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {req.machine_name}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {req.requester_org_name} — {req.requester_name}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {req.from_date} → {req.to_date}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">
          Siste aktivitet
        </h3>
        {data.recentBookings.length === 0 ? (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5 text-center">
            <p className="text-[#6B7280] text-sm">Ingen nylige bookinger</p>
          </div>
        ) : (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2330]">
                  {["Maskin", "Låntaker", "Fra", "Til"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2330]">
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1E2330]/50">
                    <td className="px-4 py-3 text-sm text-white">
                      {b.machine_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      {b.borrower_org_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      {b.from_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      {b.to_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
