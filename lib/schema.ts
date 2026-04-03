import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  date,
} from "drizzle-orm/pg-core";

// organizations
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("bedrift"), // "bedrift" | "etat"
  created_at: timestamp("created_at").defaultNow(),
});

// projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organization_id: integer("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  location: text("location"),
  start_date: date("start_date"),
  end_date: date("end_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// machines
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  serial_number: text("serial_number"),
  type: text("type").notNull(), // gravemaskine | hjullaster | minigraver | lift | kompressor | truck | kran | annet
  status: text("status").notNull().default("available"), // available | booked | under_maintenance
  owner_organization_id: integer("owner_organization_id")
    .notNull()
    .references(() => organizations.id),
  project_id: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  responsible_name: text("responsible_name"),
  responsible_phone: text("responsible_phone"),
  responsible_email: text("responsible_email"),
  notes: text("notes"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
});

// maintenance_logs
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

// loan_requests
export const loan_requests = pgTable("loan_requests", {
  id: serial("id").primaryKey(),
  machine_id: integer("machine_id")
    .notNull()
    .references(() => machines.id),
  requester_organization_id: integer("requester_organization_id")
    .notNull()
    .references(() => organizations.id),
  requester_name: text("requester_name").notNull(),
  requester_phone: text("requester_phone"),
  requester_email: text("requester_email"),
  from_date: date("from_date").notNull(),
  to_date: date("to_date").notNull(),
  purpose: text("purpose"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | returned
  response_message: text("response_message"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  machine_id: integer("machine_id")
    .notNull()
    .references(() => machines.id),
  loan_request_id: integer("loan_request_id").references(
    () => loan_requests.id
  ),
  from_date: date("from_date").notNull(),
  to_date: date("to_date").notNull(),
  borrower_organization_id: integer("borrower_organization_id")
    .notNull()
    .references(() => organizations.id),
  created_at: timestamp("created_at").defaultNow(),
});

// TypeScript types
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Machine = typeof machines.$inferSelect;
export type NewMachine = typeof machines.$inferInsert;
export type MaintenanceLog = typeof maintenance_logs.$inferSelect;
export type NewMaintenanceLog = typeof maintenance_logs.$inferInsert;
export type LoanRequest = typeof loan_requests.$inferSelect;
export type NewLoanRequest = typeof loan_requests.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

// Machine type labels
export const MACHINE_TYPE_LABELS: Record<string, string> = {
  gravemaskine: "Gravemaskin",
  hjullaster: "Hjullaster",
  minigraver: "Minigraver",
  lift: "Lift",
  kompressor: "Kompressor",
  truck: "Truck",
  kran: "Kran",
  annet: "Annet",
};

export const MACHINE_TYPES = Object.keys(MACHINE_TYPE_LABELS);
