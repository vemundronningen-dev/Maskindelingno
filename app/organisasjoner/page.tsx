"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

type OrgWithCounts = {
  id: number;
  name: string;
  type: string;
  created_at: string | null;
  machine_count: number;
  project_count: number;
};

export default function OrganisasjonerPage() {
  const [orgs, setOrgs] = useState<OrgWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("bedrift");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  async function fetchOrgs() {
    const res = await fetch("/api/organizations");
    const data = await res.json();
    setOrgs(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrgs();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type }),
      });
      setName("");
      setType("bedrift");
      fetchOrgs();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(id: number) {
    await fetch(`/api/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, type: editType }),
    });
    setEditingId(null);
    fetchOrgs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Slett denne organisasjonen? Dette kan ikke angres.")) return;
    await fetch(`/api/organizations/${id}`, { method: "DELETE" });
    fetchOrgs();
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Organisasjoner</h2>
        <p className="text-[#6B7280] text-sm mt-1">
          Bedrifter og etater i maskindelingen
        </p>
      </div>

      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5 mb-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Navn
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Navn på organisasjon…"
            className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#F59E0B]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
          >
            <option value="bedrift">Bedrift</option>
            <option value="etat">Etat</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          {submitting ? "…" : "Legg til"}
        </button>
      </form>

      {/* Org list */}
      {loading ? (
        <div className="text-center text-[#6B7280] text-sm py-8">Laster…</div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="bg-[#161B27] border border-[#1E2330] rounded-lg px-5 py-4 flex items-center gap-4"
            >
              {editingId === org.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-[#0F1117] border border-[#374151] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="bg-[#0F1117] border border-[#374151] rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="bedrift">Bedrift</option>
                    <option value="etat">Etat</option>
                  </select>
                  <button
                    onClick={() => handleEdit(org.id)}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-[#6B7280] hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{org.name}</p>
                  </div>
                  <StatusBadge status={org.type} />
                  <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                    <span>{org.machine_count} maskiner</span>
                    <span>{org.project_count} prosjekter</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingId(org.id);
                      setEditName(org.name);
                      setEditType(org.type);
                    }}
                    className="text-[#6B7280] hover:text-white transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    className="text-[#6B7280] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
          {orgs.length === 0 && (
            <div className="text-center text-[#6B7280] text-sm py-8 bg-[#161B27] border border-[#1E2330] rounded-lg">
              Ingen organisasjoner registrert ennå.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
