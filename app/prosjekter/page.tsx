"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import MachineCard from "@/components/MachineCard";

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

type Project = {
  id: number;
  name: string;
  organization_id: number;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
};

type Organization = {
  id: number;
  name: string;
  type: string;
};

function DraggableMachineCard({ machine }: { machine: MachineWithRelations }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: machine.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <MachineCard machine={machine} compact dragging={isDragging} />
    </div>
  );
}

function KanbanColumn({
  projectId,
  projectName,
  orgName,
  machines,
  isOver,
}: {
  projectId: string;
  projectName: string;
  orgName?: string;
  machines: MachineWithRelations[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id: projectId });
  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-[#161B27] border rounded-lg p-4 min-h-96 flex flex-col transition-colors ${
        isOver ? "border-[#F59E0B]/50" : "border-[#1E2330]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-white">{projectName}</p>
          {orgName && (
            <p className="text-xs text-[#6B7280] mt-0.5">{orgName}</p>
          )}
        </div>
        <span className="bg-[#1E2330] text-[#9CA3AF] text-xs px-2 py-0.5 rounded-full">
          {machines.length}
        </span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {machines.map((m) => (
          <DraggableMachineCard key={m.id} machine={m} />
        ))}
        {machines.length === 0 && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-[#1E2330] rounded-lg text-[#374151] text-xs">
            Slipp maskin her
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProsjekterPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [machines, setMachines] = useState<MachineWithRelations[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    organization_id: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function fetchAll() {
    const safe = (url: string) =>
      fetch(url).then((r) => r.json().then((d) => Array.isArray(d) ? d : [])).catch(() => []);
    const [p, m, o] = await Promise.all([
      safe("/api/projects"),
      safe("/api/machines"),
      safe("/api/organizations"),
    ]);
    setProjects(p);
    setMachines(m);
    setOrganizations(o);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll().catch(console.error);
  }, []);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setOverColumnId(null);
    const machineId = Number(event.active.id);
    if (!event.over) return;
    const targetProjectId =
      event.over.id === "unassigned" ? null : Number(event.over.id);

    const prev = machines;
    setMachines((ms) =>
      ms.map((m) =>
        m.id === machineId ? { ...m, project_id: targetProjectId } : m
      )
    );

    try {
      const res = await fetch(`/api/machines/${machineId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: targetProjectId }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch (e) {
      console.error(e);
      setMachines(prev);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProject,
          organization_id: Number(newProject.organization_id),
        }),
      });
      if (res.ok) {
        setNewProject({
          name: "",
          organization_id: "",
          location: "",
          start_date: "",
          end_date: "",
        });
        setShowNewProject(false);
        fetchAll();
      }
    } finally {
      setSubmitting(false);
    }
  }

  const activeMachine = machines.find((m) => m.id === activeId) ?? null;

  const inputClass =
    "w-full bg-[#0F1117] border border-[#374151] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F59E0B]";

  const orgById = (id: number) => organizations.find((o) => o.id === id);

  if (loading) {
    return (
      <div className="text-center text-[#6B7280] text-sm pt-16">Laster...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Prosjekter</h2>
          <p className="text-[#6B7280] text-sm mt-1">
            Dra maskiner mellom prosjekter
          </p>
        </div>
        <button
          onClick={() => setShowNewProject(!showNewProject)}
          className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold text-sm px-4 py-2 rounded-md transition-colors"
        >
          {showNewProject ? "Avbryt" : "+ Nytt prosjekt"}
        </button>
      </div>

      {showNewProject && (
        <form
          onSubmit={handleAddProject}
          className="bg-[#161B27] border border-[#1E2330] rounded-lg p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-white mb-4">
            Nytt prosjekt
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Prosjektnavn *
              </label>
              <input
                type="text"
                required
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                Organisasjon *
              </label>
              <select
                required
                value={newProject.organization_id}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    organization_id: e.target.value,
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
                Lokasjon
              </label>
              <input
                type="text"
                value={newProject.location}
                onChange={(e) =>
                  setNewProject({ ...newProject, location: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  Startdato
                </label>
                <input
                  type="date"
                  value={newProject.start_date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, start_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  Sluttdato
                </label>
                <input
                  type="date"
                  value={newProject.end_date}
                  onChange={(e) =>
                    setNewProject({ ...newProject, end_date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-black font-semibold text-sm px-5 py-2 rounded-md transition-colors"
            >
              {submitting ? "Lagrer…" : "Opprett prosjekt"}
            </button>
          </div>
        </form>
      )}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Unassigned column */}
          <KanbanColumn
            projectId="unassigned"
            projectName="Ikke tildelt"
            machines={machines.filter((m) => m.project_id === null)}
            isOver={overColumnId === "unassigned"}
          />

          {/* Project columns */}
          {projects.map((p) => (
            <KanbanColumn
              key={p.id}
              projectId={String(p.id)}
              projectName={p.name}
              orgName={orgById(p.organization_id)?.name}
              machines={machines.filter((m) => m.project_id === p.id)}
              isOver={overColumnId === String(p.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeMachine ? (
            <MachineCard machine={activeMachine} compact dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
