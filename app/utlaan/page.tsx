"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";

type LoanRequest = {
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

export default function UtlaanPage() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseMsg, setResponseMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    const res = await fetch("/api/loan-requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAction(id: number, status: "approved" | "rejected" | "returned") {
    setProcessing(true);
    try {
      await fetch(`/api/loan-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          response_message: responseMsg || undefined,
        }),
      });
      setRespondingId(null);
      setResponseMsg("");
      fetchRequests();
    } finally {
      setProcessing(false);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Utlån</h2>
        <p className="text-[#6B7280] text-sm mt-1">
          Håndter låneforespørsler og aktive utlån
        </p>
      </div>

      {/* Pending requests */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          Ventende forespørsler
          {pending.length > 0 && (
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </h3>

        {loading ? (
          <div className="text-center text-[#6B7280] text-sm py-8">Laster…</div>
        ) : pending.length === 0 ? (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6 text-center text-[#6B7280] text-sm">
            Ingen ventende forespørsler.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((req) => (
              <div
                key={req.id}
                className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {req.machine_name}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Eies av {req.owner_org_name}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-[#9CA3AF] mb-3">
                  <div>
                    <span className="text-[#6B7280]">Fra:</span> {req.from_date}
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Til:</span> {req.to_date}
                  </div>
                  <div>
                    <span className="text-[#6B7280]">Søker:</span>{" "}
                    {req.requester_name} ({req.requester_org_name})
                  </div>
                  {req.requester_phone && (
                    <div>
                      <span className="text-[#6B7280]">Tlf:</span>{" "}
                      <a
                        href={`tel:${req.requester_phone}`}
                        className="text-[#F59E0B] hover:underline"
                      >
                        {req.requester_phone}
                      </a>
                    </div>
                  )}
                </div>

                {req.purpose && (
                  <p className="text-xs text-[#9CA3AF] mb-3 italic">
                    &ldquo;{req.purpose}&rdquo;
                  </p>
                )}

                {respondingId === req.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={responseMsg}
                      onChange={(e) => setResponseMsg(e.target.value)}
                      placeholder="Valgfri melding til søker…"
                      rows={2}
                      className="w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white placeholder-[#4B5563] focus:outline-none focus:border-[#F59E0B] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req.id, "approved")}
                        disabled={processing}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                      >
                        {processing ? "…" : "Godkjenn"}
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "rejected")}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors"
                      >
                        {processing ? "…" : "Avvis"}
                      </button>
                      <button
                        onClick={() => {
                          setRespondingId(null);
                          setResponseMsg("");
                        }}
                        className="text-xs text-[#6B7280] hover:text-white px-3 py-2 transition-colors"
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setRespondingId(req.id)}
                    className="text-xs font-medium text-[#F59E0B] hover:underline"
                  >
                    Behandle forespørsel →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All other requests */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">
          Alle forespørsler
        </h3>
        {others.length === 0 && !loading ? (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-6 text-center text-[#6B7280] text-sm">
            Ingen behandlede forespørsler.
          </div>
        ) : (
          <div className="bg-[#161B27] border border-[#1E2330] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E2330]">
                  {["Maskin", "Søker", "Fra", "Til", "Formål", "Status", ""].map(
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
                {[...pending, ...others].map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#1E2330]/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {req.machine_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      <div>{req.requester_name}</div>
                      <div className="text-xs text-[#6B7280]">
                        {req.requester_org_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      {req.from_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                      {req.to_date}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF] max-w-[160px] truncate">
                      {req.purpose ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === "approved" && (
                        <button
                          onClick={() => handleAction(req.id, "returned")}
                          className="text-xs text-[#6B7280] hover:text-emerald-400 transition-colors"
                        >
                          Marker returnert
                        </button>
                      )}
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
