"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type Machine = {
  id: number;
  name: string;
  type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  serial_number: string | null;
  status: string;
  location: string | null;
  notes: string | null;
  responsible_name: string | null;
  responsible_phone: string | null;
  responsible_email: string | null;
  created_at: string | null;
};

type Log = {
  id: number;
  machine_id: number;
  title: string;
  description: string | null;
  performed_by: string | null;
  date: string;
  next_due_date: string | null;
  created_at: string | null;
};

const emptyLog = {
  title: "",
  description: "",
  performed_by: "",
  date: new Date().toISOString().split("T")[0],
  next_due_date: "",
};

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [machine, setMachine] = useState<Machine | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyLog);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/machines/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMachine(data.machine);
      setLogs(data.logs);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, machine_id: id }),
      });
      if (res.ok) {
        setForm(emptyLog);
        fetchData();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center text-[#6B7280] text-sm pt-16">Laster…</div>
    );
  }

  if (!machine) {
    return (
      <div className="text-center text-[#6B7280] text-sm pt-16">
        Maskin ikke funnet.{" "}
        <Link href="/maskiner" className="text-[#F59E0B]">
          Tilbake
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/maskiner"
            className="text-xs text-[#6B7280] hover:text-white transition-colors mb-2 inline-block"
          >
            ← Maskiner
          </Link>
          <h2 className="text-2xl font-bold text-white">{machine.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={machine.status} />
            <span className="text-[#6B7280] text-sm">{machine.type}</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Slett denne maskinen?")) {
              fetch(`/api/machines/${id}`, { method: "DELETE" }).then(() =>
                router.push("/maskiner")
              );
            }
          }}
          className="text-xs text-[#6B7280] hover:text-red-400 transition-colors"
        >
          Slett maskin
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Machine info */}
        <div className="col-span-2 bg-[#161B27] border border-[#1E2330] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Maskininformasjon
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Merke" value={machine.make} />
            <InfoRow label="Modell" value={machine.model} />
            <InfoRow label="År" value={machine.year?.toString()} />
            <InfoRow label="Serienummer" value={machine.serial_number} />
            <InfoRow label="Plassering" value={machine.location} />
          </div>
          {machine.notes && (
            <div className="mt-4 pt-4 border-t border-[#1E2330]">
              <p className="text-xs text-[#6B7280] font-medium mb-1">Notater</p>
              <p className="text-sm text-[#D1D5DB]">{machine.notes}</p>
            </div>
          )}
        </div>

        {/* Responsible person */}
        <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Ansvarlig</h3>
          {machine.responsible_name ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#6B7280] font-medium">Navn</p>
                <p className="text-sm text-white mt-0.5">
                  {machine.responsible_name}
                </p>
              </div>
              {machine.responsible_phone && (
                <div>
                  <p className="text-xs text-[#6B7280] font-medium">Telefon</p>
                  <a
                    href={`tel:${machine.responsible_phone}`}
                    className="text-sm text-[#F59E0B] hover:underline mt-0.5 block"
                  >
                    {machine.responsible_phone}
                  </a>
                </div>
              )}
              {machine.responsible_email && (
                <div>
                  <p className="text-xs text-[#6B7280] font-medium">E-post</p>
                  <a
                    href={`mailto:${machine.responsible_email}`}
                    className="text-sm text-[#F59E0B] hover:underline mt-0.5 block break-all"
                  >
                    {machine.responsible_email}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Ingen ansvarlig angitt.</p>
          )}
        </div>
      </div>

      {/* Maintenance logs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Vedlikeholdslogg ({logs.length})
        </h3>
        {logs.length === 0 ? (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6 text-center text-[#6B7280] text-sm">
            Ingen vedlikeholdslogger ennå.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const isOverdue =
                log.next_due_date &&
                log.next_due_date < new Date().toISOString().split("T")[0];
              return (
                <div
                  key={log.id}
                  className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {log.title}
                      </p>
                      {log.description && (
                        <p className="text-sm text-[#9CA3AF] mt-1">
                          {log.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs text-[#6B7280]">
                        Utført: {log.date}
                      </p>
                      {log.next_due_date && (
                        <p
                          className={`text-xs mt-0.5 ${
                            isOverdue ? "text-red-400" : "text-[#6B7280]"
                          }`}
                        >
                          Neste: {log.next_due_date}
                          {isOverdue && " (forfalt)"}
                        </p>
                      )}
                    </div>
                  </div>
                  {log.performed_by && (
                    <p className="text-xs text-[#6B7280] mt-2">
                      Av: {log.performed_by}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log maintenance form */}
      <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Logg vedlikehold
        </h3>
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Tittel *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Utført av
              </label>
              <input
                type="text"
                value={form.performed_by}
                onChange={(e) =>
                  setForm({ ...form, performed_by: e.target.value })
                }
                className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Dato *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Neste forfallsdato
              </label>
              <input
                type="date"
                value={form.next_due_date}
                onChange={(e) =>
                  setForm({ ...form, next_due_date: e.target.value })
                }
                className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Beskrivelse
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              {submitting ? "Lagrer…" : "Logg vedlikehold"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-[#6B7280] font-medium">{label}</p>
      <p className="text-sm text-white mt-0.5">{value ?? "—"}</p>
    </div>
  );
}
