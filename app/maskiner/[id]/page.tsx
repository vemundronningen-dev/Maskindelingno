"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
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

type MaintenanceLog = {
  id: number;
  machine_id: number;
  title: string;
  description: string | null;
  performed_by: string | null;
  date: string;
  next_due_date: string | null;
  created_at: string | null;
};

type Booking = {
  id: number;
  machine_id: number;
  loan_request_id: number | null;
  from_date: string;
  to_date: string;
  borrower_organization_id: number;
  created_at: string | null;
  borrower_org_name?: string;
};

type Organization = { id: number; name: string; type: string };

const emptyLog = {
  title: "",
  description: "",
  performed_by: "",
  date: new Date().toISOString().split("T")[0],
  next_due_date: "",
};

const emptyLoanForm = {
  requester_organization_id: "",
  requester_name: "",
  requester_phone: "",
  requester_email: "",
  purpose: "",
  from_date: "",
  to_date: "",
};

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

export default function MachineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [machine, setMachine] = useState<MachineWithRelations | null>(null);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const [logForm, setLogForm] = useState(emptyLog);
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  const [loanForm, setLoanForm] = useState(emptyLoanForm);
  const [loanSubmitting, setLoanSubmitting] = useState(false);
  const [loanSuccess, setLoanSuccess] = useState(false);
  const [loanError, setLoanError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [machineRes, orgsRes] = await Promise.all([
        fetch(`/api/machines/${id}`),
        fetch("/api/organizations"),
      ]);
      if (machineRes.ok) {
        const data = await machineRes.json();
        setMachine(data.machine);
        setLogs(
          [...(data.maintenance_logs ?? data.logs ?? [])].sort(
            (a: MaintenanceLog, b: MaintenanceLog) =>
              b.date.localeCompare(a.date)
          )
        );
        setBookings(data.bookings ?? []);
      }
      if (orgsRes.ok) {
        setOrganizations(await orgsRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleLogSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLogSubmitting(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...logForm, machine_id: Number(id) }),
      });
      if (res.ok) {
        setLogForm(emptyLog);
        setLogSuccess(true);
        setTimeout(() => setLogSuccess(false), 3000);
        fetchData();
      }
    } finally {
      setLogSubmitting(false);
    }
  }

  async function handleLoanSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoanSubmitting(true);
    setLoanError(null);
    try {
      const res = await fetch("/api/loan-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...loanForm,
          machine_id: Number(id),
          requester_organization_id: Number(loanForm.requester_organization_id),
        }),
      });
      if (res.ok) {
        setLoanForm(emptyLoanForm);
        setLoanSuccess(true);
        setTimeout(() => setLoanSuccess(false), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        setLoanError(data.error ?? "Noe gikk galt. Prøv igjen.");
      }
    } catch (e) {
      console.error(e);
      setLoanError("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoanSubmitting(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

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

  const bookedRanges = bookings.map((b) => ({
    from_date: b.from_date,
    to_date: b.to_date,
    borrower_org_name: b.borrower_org_name,
  }));

  const inputClass =
    "w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]";

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <Link
          href="/maskiner"
          className="text-xs text-[#6B7280] hover:text-white transition-colors mb-2 inline-block"
        >
          ← Maskiner
        </Link>
        <h2 className="text-2xl font-bold text-white">
          {machine.make} {machine.model}
        </h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2 py-0.5 rounded font-medium">
            {MACHINE_TYPE_LABELS[machine.type] ?? machine.type}
          </span>
          <StatusBadge status={machine.status} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Machine info */}
        <div className="col-span-2 bg-[#161B27] border border-[#1E2330] rounded-lg p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Maskininformasjon
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Merke" value={machine.make} />
            <InfoRow label="Modell" value={machine.model} />
            <InfoRow label="Serienummer" value={machine.serial_number} />
            <InfoRow label="Type" value={MACHINE_TYPE_LABELS[machine.type] ?? machine.type} />
            <InfoRow label="Eier" value={machine.owner_org_name} />
            <InfoRow label="Prosjekt" value={machine.project_name} />
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

      {/* Availability Calendar */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4">
          Tilgjengelighetskalender
        </h3>
        <AvailabilityCalendar bookedRanges={bookedRanges} />
      </div>

      {/* Loan request form */}
      <div className="mb-8 bg-[#161B27] border border-[#1E2330] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Send låneforespørsel
        </h3>

        {loanSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4">
            <p className="text-emerald-400 text-sm">
              Forespørsel sendt! Vi tar kontakt snart.
            </p>
          </div>
        )}
        {loanError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-400 text-sm">{loanError}</p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-xs text-[#9CA3AF] mb-3">
            Velg periode i kalenderen nedenfor, eller fyll inn datoene manuelt.
          </p>
          <AvailabilityCalendar
            bookedRanges={bookedRanges}
            selectionMode
            onRangeSelect={(from, to) =>
              setLoanForm((f) => ({ ...f, from_date: from, to_date: to }))
            }
          />
        </div>

        <form onSubmit={handleLoanSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Fra dato *
              </label>
              <input
                type="date"
                required
                value={loanForm.from_date}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, from_date: e.target.value })
                }
                min={today}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Til dato *
              </label>
              <input
                type="date"
                required
                value={loanForm.to_date}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, to_date: e.target.value })
                }
                min={loanForm.from_date || today}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Din organisasjon *
              </label>
              <select
                required
                value={loanForm.requester_organization_id}
                onChange={(e) =>
                  setLoanForm({
                    ...loanForm,
                    requester_organization_id: e.target.value,
                  })
                }
                className={inputClass}
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
                Ditt navn *
              </label>
              <input
                type="text"
                required
                value={loanForm.requester_name}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, requester_name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={loanForm.requester_phone}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, requester_phone: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                E-post
              </label>
              <input
                type="email"
                value={loanForm.requester_email}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, requester_email: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Formål
            </label>
            <textarea
              value={loanForm.purpose}
              onChange={(e) =>
                setLoanForm({ ...loanForm, purpose: e.target.value })
              }
              rows={3}
              placeholder="Beskriv hva maskinen skal brukes til…"
              className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#F59E0B] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loanSubmitting}
              className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              {loanSubmitting ? "Sender…" : "Send forespørsel"}
            </button>
          </div>
        </form>
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
                log.next_due_date && log.next_due_date < today;
              return (
                <div
                  key={log.id}
                  className={`bg-[#161B27] border rounded-lg p-5 ${
                    isOverdue
                      ? "border-red-500/30"
                      : "border-[#1E2330]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {log.title}
                      </p>
                      {log.description && (
                        <p className="text-sm text-[#9CA3AF] mt-1">
                          {log.description}
                        </p>
                      )}
                      {log.performed_by && (
                        <p className="text-xs text-[#6B7280] mt-2">
                          Utført av: {log.performed_by}
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
                            isOverdue ? "text-red-400 font-medium" : "text-[#6B7280]"
                          }`}
                        >
                          Neste: {log.next_due_date}
                          {isOverdue && " ⚠ Forfalt"}
                        </p>
                      )}
                    </div>
                  </div>
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
        {logSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
            <p className="text-emerald-400 text-sm">
              Vedlikehold logget!
            </p>
          </div>
        )}
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Tittel *
              </label>
              <input
                type="text"
                required
                value={logForm.title}
                onChange={(e) =>
                  setLogForm({ ...logForm, title: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Utført av
              </label>
              <input
                type="text"
                value={logForm.performed_by}
                onChange={(e) =>
                  setLogForm({ ...logForm, performed_by: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Dato *
              </label>
              <input
                type="date"
                required
                value={logForm.date}
                onChange={(e) =>
                  setLogForm({ ...logForm, date: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Neste forfallsdato
              </label>
              <input
                type="date"
                value={logForm.next_due_date}
                onChange={(e) =>
                  setLogForm({ ...logForm, next_due_date: e.target.value })
                }
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
              Beskrivelse
            </label>
            <textarea
              value={logForm.description}
              onChange={(e) =>
                setLogForm({ ...logForm, description: e.target.value })
              }
              rows={3}
              className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B] resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={logSubmitting}
              className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              {logSubmitting ? "Lagrer…" : "Logg vedlikehold"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
