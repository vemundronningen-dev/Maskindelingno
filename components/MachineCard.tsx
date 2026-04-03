"use client";

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

type Props = {
  machine: MachineWithRelations;
  onClick?: () => void;
  compact?: boolean;
  dragging?: boolean;
};

function statusDotColor(status: string) {
  if (status === "available") return "bg-emerald-500";
  if (status === "booked") return "bg-amber-500";
  return "bg-red-500";
}

export default function MachineCard({
  machine,
  onClick,
  compact = false,
  dragging = false,
}: Props) {
  const typeLabel = MACHINE_TYPE_LABELS[machine.type] ?? machine.type;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`bg-[#161B27] border border-[#1E2330] rounded-lg p-3 hover:border-[#F59E0B]/30 cursor-pointer transition-all ${
          dragging ? "shadow-2xl opacity-80 rotate-1" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-white text-sm font-semibold leading-tight">
            {machine.make} {machine.model}
          </p>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${statusDotColor(machine.status)}`}
          />
        </div>
        {machine.serial_number && (
          <p className="text-[#6B7280] text-xs mb-2 truncate">
            S/N: {machine.serial_number}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={machine.status} />
          {machine.responsible_name && (
            <span className="text-xs text-[#9CA3AF] bg-[#1E2330] px-2 py-0.5 rounded truncate max-w-[120px]">
              {machine.responsible_name}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-[#161B27] border border-[#1E2330] rounded-lg p-4 hover:border-[#F59E0B]/30 cursor-pointer transition-all ${
        dragging ? "shadow-2xl opacity-80 rotate-1" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs px-2 py-0.5 rounded font-medium">
          {typeLabel}
        </span>
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${statusDotColor(machine.status)}`}
        />
      </div>

      <p className="text-white font-semibold text-sm leading-tight">
        {machine.make} {machine.model}
      </p>

      {machine.serial_number && (
        <p className="text-[#6B7280] text-xs mt-1">S/N: {machine.serial_number}</p>
      )}

      {machine.owner_org_name && (
        <p className="text-[#9CA3AF] text-xs mt-2">{machine.owner_org_name}</p>
      )}

      {machine.project_name && (
        <p className="text-[#6B7280] text-xs mt-0.5 truncate">
          Prosjekt: {machine.project_name}
        </p>
      )}

      <div className="mt-3">
        <StatusBadge status={machine.status} />
      </div>
    </div>
  );
}
