"use client";

import { useState, useEffect, useCallback } from "react";
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
  responsible_name: string | null;
  responsible_phone: string | null;
  responsible_email: string | null;
  notes: string | null;
  created_at: string | null;
};

const emptyForm = {
  name: "",
  type: "",
  make: "",
  model: "",
  year: "",
  serial_number: "",
  status: "active",
  location: "",
  notes: "",
  responsible_name: "",
  responsible_phone: "",
  responsible_email: "",
};

export default function MaskinerPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMachines = useCallback(async () => {
    const res = await fetch("/api/machines");
    const data = await res.json();
    setMachines(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        fetchMachines();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Slett denne maskinen?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/machines/${id}`, { method: "DELETE" });
      setMachines((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

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

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">
            Ny maskin
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Navn *"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <Field
              label="Type *"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              placeholder="Gravemaskin, Hjullaster…"
              required
            />
            <Field
              label="Merke"
              value={form.make}
              onChange={(v) => setForm({ ...form, make: v })}
            />
            <Field
              label="Modell"
              value={form.model}
              onChange={(v) => setForm({ ...form, model: v })}
            />
            <Field
              label="År"
              value={form.year}
              onChange={(v) => setForm({ ...form, year: v })}
              type="number"
            />
            <Field
              label="Serienummer"
              value={form.serial_number}
              onChange={(v) => setForm({ ...form, serial_number: v })}
            />
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
              >
                <option value="active">Aktiv</option>
                <option value="under_maintenance">Under vedlikehold</option>
                <option value="retired">Pensjonert</option>
              </select>
            </div>
            <Field
              label="Plassering"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
            />
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

      {/* Table */}
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
                {["Navn", "Type", "Status", "Plassering", "Ansvarlig", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2330]">
              {machines.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-[#1E2330]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/maskiner/${m.id}`}
                      className="text-sm font-medium text-white hover:text-[#F59E0B] transition-colors"
                    >
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.type}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                    {m.responsible_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
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
