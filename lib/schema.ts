import { pgTable, serial, text, timestamp, integer, date } from "drizzle-orm/pg-core";

export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  serial_number: text("serial_number"),
  status: text("status", { enum: ["active", "under_maintenance", "retired"] })
    .notNull()
    .default("active"),
  location: text("location"),
  notes: text("notes"),
  responsible_name: text("responsible_name"),
  responsible_phone: text("responsible_phone"),
  responsible_email: text("responsible_email"),
  created_at: timestamp("created_at").defaultNow(),
});

export const maintenance_logs = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  machine_id: integer("machine_id")
    .notNull()
    .references(() => machines.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  performed_by: text("performed_by"),
  date: date("date").notNull(),
  next_due_date: date("next_due_date"),
  created_at: timestamp("created_at").defaultNow(),
});

export type Machine = typeof machines.$inferSelect;
export type NewMachine = typeof machines.$inferInsert;
export type MaintenanceLog = typeof maintenance_logs.$inferSelect;
export type NewMaintenanceLog = typeof maintenance_logs.$inferInsert;
