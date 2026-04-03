"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MachineCard from "@/components/MachineCard";
import { MACHINE_TYPE_LABELS } from "@/lib/schema";

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

type Organization = { id: number; name: string; type: string };

export default function UtforskPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<MachineWithRelations[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/machines").then((r) => r.json()),
      fetch("/api/organizations").then((r) => r.json()),
    ]).then(([m, o]) => {
      setMachines(m);
      setOrgs(o);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return machines.filter((m) => {
      if (
        q &&
        !m.make.toLowerCase().includes(q) &&
        !m.model.toLowerCase().includes(q) &&
        !(m.serial_number ?? "").toLowerCase().includes(q)
      )
        return false;
      if (filterType && m.type !== filterType) return false;
      if (filterStatus && m.status !== filterStatus) return false;
      if (filterOrg && String(m.owner_organization_id) !== filterOrg) return false;
      return true;
    });
  }, [machines, search, filterType, filterStatus, filterOrg]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Utforsk maskiner</h2>
        <p className="text-[#6B7280] text-sm mt-1">
          Finn og lån maskiner fra hele organisasjonen
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Søk merke, modell, serienr…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#161B27] border border-[#1E2330] rounded-md px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#F59E0B] w-56"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#161B27] border border-[#1E2330] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
        >
          <option value="">Alle typer</option>
          {Object.entries(MACHINE_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#161B27] border border-[#1E2330] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
        >
          <option value="">Alle statuser</option>
          <option value="available">Tilgjengelig</option>
          <option value="booked">Utlånt</option>
          <option value="under_maintenance">Under vedlikehold</option>
        </select>
        <select
          value={filterOrg}
          onChange={(e) => setFilterOrg(e.target.value)}
          className="bg-[#161B27] border border-[#1E2330] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
        >
          <option value="">Alle organisasjoner</option>
          {orgs.map((o) => (
            <option key={o.id} value={String(o.id)}>
              {o.name}
            </option>
          ))}
        </select>
        {(search || filterType || filterStatus || filterOrg) && (
          <button
            onClick={() => {
              setSearch("");
              setFilterType("");
              setFilterStatus("");
              setFilterOrg("");
            }}
            className="text-xs text-[#6B7280] hover:text-white transition-colors px-2"
          >
            Nullstill filter
          </button>
        )}
      </div>

      <p className="text-xs text-[#6B7280] mb-4">
        {filtered.length} maskin{filtered.length !== 1 ? "er" : ""} funnet
      </p>

      {loading ? (
        <div className="text-center text-[#6B7280] text-sm py-16">Laster…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-[#6B7280] text-sm py-16 bg-[#161B27] border border-[#1E2330] rounded-lg">
          Ingen maskiner matcher søket ditt.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MachineCard
              key={m.id}
              machine={m}
              onClick={() => router.push(`/maskiner/${m.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
