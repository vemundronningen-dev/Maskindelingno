"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: "⊞" },
    { href: "/maskiner", label: "Maskiner", icon: "⚙" },
  ];

  return (
    <aside className="w-56 min-h-screen bg-[#0A0D13] border-r border-[#1E2330] flex flex-col">
      <div className="px-6 py-5 border-b border-[#1E2330]">
        <h1 className="text-[#F59E0B] font-bold text-lg tracking-tight">
          Maskindeling
        </h1>
        <p className="text-[#6B7280] text-xs mt-0.5">Anleggsmaskiner</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                  : "text-[#9CA3AF] hover:text-white hover:bg-[#1E2330]"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
