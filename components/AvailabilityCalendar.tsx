"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type BookedRange = {
  from_date: string;
  to_date: string;
  borrower_org_name?: string;
};

type Props = {
  bookedRanges: BookedRange[];
  onRangeSelect?: (from: string, to: string) => void;
  selectionMode?: boolean;
};

const WEEKDAYS = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];

const MONTH_NAMES = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isDateBooked(date: Date, ranges: BookedRange[]): boolean {
  const ds = formatDate(date);
  return ranges.some((r) => ds >= r.from_date && ds <= r.to_date);
}

function isBetween(ds: string, from: string, to: string): boolean {
  const [a, b] = from <= to ? [from, to] : [to, from];
  return ds >= a && ds <= b;
}

export default function AvailabilityCalendar({
  bookedRanges,
  onRangeSelect,
  selectionMode = false,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);
  const [selectedTo, setSelectedTo] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // First day of month (0=Sun, 1=Mon, ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday=0 offset
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const prevMonth = () =>
    setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(year, month + 1, 1));

  const handleDayClick = (date: Date) => {
    if (!selectionMode) return;
    const ds = formatDate(date);
    const isPast = date < today;
    const booked = isDateBooked(date, bookedRanges);
    if (isPast || booked) return;

    if (!selectedFrom || (selectedFrom && selectedTo)) {
      setSelectedFrom(ds);
      setSelectedTo(null);
    } else {
      const newTo = ds;
      setSelectedTo(newTo);
      if (onRangeSelect) {
        const [a, b] =
          selectedFrom <= newTo ? [selectedFrom, newTo] : [newTo, selectedFrom];
        onRangeSelect(a, b);
      }
    }
  };

  return (
    <div className="bg-[#161B27] border border-[#1E2330] rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded hover:bg-[#1E2330] text-[#9CA3AF] hover:text-white transition-colors"
          type="button"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-semibold text-sm">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded hover:bg-[#1E2330] text-[#9CA3AF] hover:text-white transition-colors"
          type="button"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs text-[#6B7280] font-medium py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: totalCells }).map((_, i) => {
          const dayNum = i - startOffset + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <div key={i} className="aspect-square" />;
          }

          const date = new Date(year, month, dayNum);
          date.setHours(0, 0, 0, 0);
          const ds = formatDate(date);
          const isPast = date < today;
          const isToday = ds === formatDate(today);
          const booked = isDateBooked(date, bookedRanges);
          const isSelected =
            selectionMode &&
            selectedFrom &&
            (selectedTo
              ? isBetween(ds, selectedFrom, selectedTo)
              : ds === selectedFrom);

          let cellClass =
            "aspect-square flex items-center justify-center text-xs rounded transition-colors ";

          if (booked) {
            cellClass += "bg-red-500/20 text-red-400 cursor-not-allowed";
          } else if (isPast) {
            cellClass += "text-[#374151] cursor-not-allowed";
          } else if (isSelected) {
            cellClass += "bg-[#F59E0B]/20 text-[#F59E0B] font-semibold";
          } else {
            cellClass +=
              selectionMode
                ? "bg-[#161B27] hover:bg-[#1E2330] text-white cursor-pointer"
                : "bg-[#161B27] text-[#9CA3AF]";
          }

          if (isToday) {
            cellClass += " ring-1 ring-[#F59E0B]";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDayClick(date)}
              className={cellClass}
              disabled={!selectionMode || booked || isPast}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#1E2330]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="text-xs text-[#9CA3AF]">Utlånt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          <span className="text-xs text-[#9CA3AF]">Tilgjengelig</span>
        </div>
        {selectionMode && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
            <span className="text-xs text-[#9CA3AF]">Valgt periode</span>
          </div>
        )}
      </div>

      {/* Selected range display */}
      {selectionMode && selectedFrom && (
        <div className="mt-3 text-xs text-[#9CA3AF]">
          {selectedTo ? (
            <span>
              Valgt:{" "}
              <span className="text-[#F59E0B]">{selectedFrom}</span> →{" "}
              <span className="text-[#F59E0B]">{selectedTo}</span>
            </span>
          ) : (
            <span>
              Fra: <span className="text-[#F59E0B]">{selectedFrom}</span> — velg
              sluttdato
            </span>
          )}
        </div>
      )}
    </div>
  );
}
