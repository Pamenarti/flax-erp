import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const moduleTypeEnum = pgEnum("module_type", [
  "finance", 
  "sales", 
  "purchase", 
  "inventory", 
  "hr", 
  "project", 
  "document", 
  "report", 
  "support",
  "quality",
  "maintenance",
  "asset"
]);

export const permissionEnum = pgEnum("permission", [
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "admin"
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  icon: text("icon").notNull(),
  type: moduleTypeEnum("type").notNull(),
  category: text("category").notNull(),
  features: text("features").array().notNull(),
  active: boolean("active").notNull().default(true),
  version: text("version").notNull().default("1.0.0"),
  slug: text("slug").notNull().unique(),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subModules = pgTable("sub_modules", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  active: boolean("active").notNull().default(true),
  route: text("route").notNull(),
  settings: jsonb("settings").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userModules = pgTable("user_modules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  activatedAt: timestamp("activated_at").defaultNow().notNull(),
  active: boolean("active").notNull().default(true),
});

// Kullanıcı rolleri tablosu
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Kullanıcı rol atamaları tablosu
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Modül izinleri tablosu
export const modulePermissions = pgTable("module_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  permission: permissionEnum("permission").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userModules: many(userModules),
  activities: many(activities),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  modulePermissions: many(modulePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const modulePermissionsRelations = relations(modulePermissions, ({ one }) => ({
  role: one(roles, { fields: [modulePermissions.roleId], references: [roles.id] }),
  module: one(modules, { fields: [modulePermissions.moduleId], references: [modules.id] }),
}));

export const modulesRelations = relations(modules, ({ many }) => ({
  userModules: many(userModules),
  subModules: many(subModules),
}));

export const subModulesRelations = relations(subModules, ({ one }) => ({
  module: one(modules, { fields: [subModules.moduleId], references: [modules.id] }),
}));

export const userModulesRelations = relations(userModules, ({ one }) => ({
  user: one(users, { fields: [userModules.userId], references: [users.id] }),
  module: one(modules, { fields: [userModules.moduleId], references: [modules.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertModuleSchema = createInsertSchema(modules);

export const insertSubModuleSchema = createInsertSchema(subModules);

export const insertUserModuleSchema = createInsertSchema(userModules).pick({
  userId: true,
  moduleId: true,
});

export const insertRoleSchema = createInsertSchema(roles);

export const insertUserRoleSchema = createInsertSchema(userRoles).pick({
  userId: true,
  roleId: true,
});

export const insertModulePermissionSchema = createInsertSchema(modulePermissions).pick({
  roleId: true,
  moduleId: true,
  permission: true,
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  action: true,
  details: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

export type InsertSubModule = z.infer<typeof insertSubModuleSchema>;
export type SubModule = typeof subModules.$inferSelect;

export type InsertUserModule = z.infer<typeof insertUserModuleSchema>;
export type UserModule = typeof userModules.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

export type InsertModulePermission = z.infer<typeof insertModulePermissionSchema>;
export type ModulePermission = typeof modulePermissions.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type UserWithModules = User & { modules: Module[] };
export type UserWithRoles = User & { roles: Role[] };
export type ModuleWithSubModules = Module & { subModules: SubModule[] };

// Modül veri tabloları (örnek tanımlar - gerektiğinde genişletilebilir)

// Finans Modülü Tabloları
export const financialAccounts = pgTable("financial_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  accountNumber: text("account_number"),
  accountType: text("account_type").notNull(),
  balance: integer("balance").default(0).notNull(),
  currency: text("currency").default("TRY").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => financialAccounts.id),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // income, expense, transfer
  category: text("category"),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Satış Modülü Tabloları
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  customerType: text("customer_type").default("individual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderNumber: text("order_number").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// İnsan Kaynakları Modülü Tabloları
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position"),
  department: text("department"),
  hireDate: timestamp("hire_date").notNull(),
  salary: integer("salary"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employeeLeaves = pgTable("employee_leaves", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  status: text("status").default("pending").notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Satın Alma Modülü Tabloları
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  contactPerson: text("contact_person"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  orderNumber: text("order_number").notNull(),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stok ve Envanter Modülü Tabloları
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  description: text("description"),
  category: text("category"),
  price: integer("price").notNull(),
  costPrice: integer("cost_price"),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  reorderLevel: integer("reorder_level").default(0),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  warehouseId: integer("warehouse_id"),
  quantity: integer("quantity").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proje Yönetimi Modülü Tabloları
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("planning").notNull(),
  budget: integer("budget"),
  manager: integer("manager").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("todo").notNull(),
  priority: text("priority").default("medium").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
