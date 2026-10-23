import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const fulfillmentTypeEnum = pgEnum("fulfillment_type", ["delivery", "pickup"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "preparing",
  "dispatched",
  "completed",
  "cancelled",
]);

export const menuItems = pgTable(
  "menu_items",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description").notNull(),
    priceKobo: integer("price_kobo").notNull(),
    imagePath: text("image_path").notNull(),
    isSpicy: boolean("is_spicy").notNull().default(false),
    isVegan: boolean("is_vegan").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("menu_items_available_idx").on(table.isAvailable),
    index("menu_items_created_at_idx").on(table.createdAt),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 40 }).notNull(),
    fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
    notes: text("notes"),
    subtotalKobo: integer("subtotal_kobo").notNull(),
    serviceFeeKobo: integer("service_fee_kobo").notNull().default(0),
    totalKobo: integer("total_kobo").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("orders_status_created_idx").on(table.status, table.createdAt)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    menuItemId: integer("menu_item_id").references(() => menuItems.id, { onDelete: "set null" }),
    itemTitle: varchar("item_title", { length: 180 }).notNull(),
    unitPriceKobo: integer("unit_price_kobo").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalKobo: integer("line_total_kobo").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);

export const settings = pgTable(
  "settings",
  {
    key: varchar("key", { length: 80 }).primaryKey(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("settings_updated_at_idx").on(table.updatedAt)],
);

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
