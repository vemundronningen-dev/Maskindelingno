"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
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
type Project = {
  id: number;
  name: string;
  organization_id: number;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

const emptyForm = {
  make: "",
  model: "",
  serial_number: "",
  type: "",
  status: "available",
  owner_organization_id: "",
  project_id: "",
  responsible_name: "",
  responsible_phone: "",
  responsible_email: "",
  notes: "",
};

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#F59E0B]"
      />
    </div>
  );
}

export default function MaskinerPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<MachineWithRelations[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    const [m, o, p] = await Promise.all([
      fetch("/api/machines").then((r) => r.json()),
      fetch("/api/organizations").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]);
    setMachines(m);
    setOrganizations(o);
    setProjects(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        owner_organization_id: Number(form.owner_organization_id),
        project_id: form.project_id ? Number(form.project_id) : null,
      };
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Slett denne maskinen? Dette kan ikke angres.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/machines/${id}`, { method: "DELETE" });
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  const selectClass =
    "w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Maskiner</h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Alle registrerte maskiner
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          {showForm ? "Avbryt" : "+ Ny maskin"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">Ny maskin</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Merke *"
              value={form.make}
              onChange={(v) => setForm({ ...form, make: v })}
              required
            />
            <Field
              label="Modell *"
              value={form.model}
              onChange={(v) => setForm({ ...form, model: v })}
              required
            />
            <Field
              label="Serienummer"
              value={form.serial_number}
              onChange={(v) => setForm({ ...form, serial_number: v })}
            />
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Type *
              </label>
              <select
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={selectClass}
              >
                <option value="">Velg type…</option>
                {Object.entries(MACHINE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={selectClass}
              >
                <option value="available">Tilgjengelig</option>
                <option value="booked">Utlånt</option>
                <option value="under_maintenance">Under vedlikehold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Organisasjon (eier) *
              </label>
              <select
                required
                value={form.owner_organization_id}
                onChange={(e) =>
                  setForm({ ...form, owner_organization_id: e.target.value })
                }
                className={selectClass}
              >
                <option value="">Velg organisasjon…</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Prosjekt (valgfri)
              </label>
              <select
                value={form.project_id}
                onChange={(e) =>
                  setForm({ ...form, project_id: e.target.value })
                }
                className={selectClass}
              >
                <option value="">Intet prosjekt</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Ansvarlig navn"
              value={form.responsible_name}
              onChange={(v) => setForm({ ...form, responsible_name: v })}
            />
            <Field
              label="Telefon"
              value={form.responsible_phone}
              onChange={(v) => setForm({ ...form, responsible_phone: v })}
            />
            <Field
              label="E-post"
              value={form.responsible_email}
              onChange={(v) => setForm({ ...form, responsible_email: v })}
              type="email"
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Notater
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B] resize-none"
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              {submitting ? "Lagrer…" : "Lagre maskin"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#161B27] border border-[#1E2330] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#6B7280] text-sm">
            Laster…
          </div>
        ) : machines.length === 0 ? (
          <div className="p-8 text-center text-[#6B7280] text-sm">
            Ingen maskiner registrert ennå.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E2330]">
                {[
                  "Merke / Modell",
                  "Type",
                  "Status",
                  "Eier",
                  "Prosjekt",
                  "Ansvarlig",
                  "",
                ].map((h) => (
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
              {machines.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => router.push(`/maskiner/${m.id}`)}
                  className="hover:bg-[#1E2330]/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white hover:text-[#F59E0B] transition-colors">
                      {m.make} {m.model}
                    </p>
                    {m.serial_number && (
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        S/N: {m.serial_number}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2 py-0.5 rounded font-medium">
                      {MACHINE_TYPE_LABELS[m.type] ?? m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.owner_org_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.project_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.responsible_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(m.id);
                      }}
                      disabled={deletingId === m.id}
                      className="text-xs text-[#6B7280] hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === m.id ? "…" : "Slett"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
