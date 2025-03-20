import {
    boolean,
    integer,
    numeric,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", [
    "broker",
    "customer",
    "admin",
    "staff",
    "guest",
]);
export const dealStages = pgEnum("dealStages", [
    "open",
    "assigned",
    "negotiation",
    "closed",
    "rejected",
]);
// export const dealMilestones = pgEnum("dealMilestones", [
//     "received",
//     "negotiation",
//     "offer",
//     "accepted",
//     "signed",
//     "closed",
// ]);

export const rtmOffplanStatus = pgEnum("rtmOffplanStatus", [
    "RTM",
    "OFFPLAN",
    "RTM/OFFPLAN",
    "NONE", // Option for no selection
]);

export const inventoryStatus = pgEnum("inventoryStatus", [
    "available",
    "sold",
    "reserved",
    "rented",
]);

// export const requirementCategory = pgEnum("requirementCategory", [
//     "RISE",
//     "NESTSEEKERS",
//     "LUXURY CONCIERGE",
// ]);

export const Users = pgTable("users", {
    userId: uuid("user_id").primaryKey(),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: rolesEnum().default("guest"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
    lastLogin: timestamp("last_login"),
    isDisabled: boolean("is_disabled").default(false),
}).enableRLS();

export const Requirements = pgTable("requirements", {
    requirementId: uuid("requirement_id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => Users.userId, { onDelete: "cascade" }),
    description: text("description"),
    dateCreated: timestamp("date_created").defaultNow().notNull(),

    demand: varchar("demand", { length: 255 }).notNull(), // The person or entity making the request
    preferredType: varchar("preferred_type", { length: 100 }).notNull(), // Type of property
    preferredLocation: varchar("preferred_location", { length: 255 }).notNull(), // Desired location
    budget: varchar("budget", { length: 50 }).notNull(), // Budget range (e.g., "900K - 1.2M")
    rtmOffplan: rtmOffplanStatus("rtm_offplan").default("NONE"), // Change to use the new enum
    phpp: boolean("phpp").default(false), // Indicates if a PHPP is applicable
    preferredSquareFootage: numeric("preferred_square_footage", {
        precision: 10,
        scale: 2,
    }), // Desired square footage
    preferredROI: numeric("preferred_roi", {
        precision: 5,
        scale: 2,
    }), // Expected ROI
    sharedWithIndianChannelPartner: boolean(
        "shared_with_indian_channel_partner"
    ).default(false), // Whether shared with a channel partner
    call: boolean("call").default(false), // Indicates if a call was made
    viewing: boolean("viewing").default(false), // Indicates if a viewing is scheduled
    category: text("requirement_category"), // Category of the requirement
    remarks: text("remarks"),
}).enableRLS();

export const Inventories = pgTable("inventories", {
    inventoryId: uuid("inventory_id").primaryKey().defaultRandom(),
    brokerId: uuid("broker_id")
        .notNull()
        .references(() => Users.userId, { onDelete: "cascade" }),
    sn: varchar("sn", { length: 50 }),
    propertyType: varchar("property_type", { length: 255 }),
    projectName: varchar("project_name", { length: 255 }),
    description: text("description"),
    location: varchar("location", { length: 255 }),
    developerName: varchar("developer_name", { length: 255 }),
    unitNumber: varchar("unit_number", { length: 20 }),
    bedRooms: integer("bed_rooms").default(0),
    maidsRoom: integer("maids_room").default(0),
    studyRoom: integer("study_room").default(0),
    carPark: integer("car_park").default(0),
    areaSQFT: numeric("area_sqft", { precision: 10, scale: 2 }),
    buSQFT: numeric("bua_sqft", { precision: 10, scale: 2 }),
    sellingPriceMillionAED: numeric("selling_price_million_aed", {
        precision: 12,
    }),
    unitStatus: inventoryStatus("unit_status").default("available"), // Using the defined inventoryStatus enum
    completionDate: timestamp("completion_date"),
    priceAED: numeric("price_aed", { precision: 12 }),
    inrCr: numeric("inr_cr", { precision: 20 }),
    rentApprox: numeric("rent_approx", { precision: 12 }),
    roiGross: numeric("roi_gross", { precision: 5, scale: 2 }),
    markup: numeric("markup", { precision: 12 }),
    brokerage: numeric("brokerage", { precision: 12 }),
    remarks: text("remarks"),
    bayut: text("bayut"),
    phppEligible: boolean("phpp_eligible").default(false), // Indicates whether PHPP is available for the property
    phppDetails: text("phpp_details"), // Potentially descriptive field for terms of the PHPP
    propertyFinder: text("property_finder"),
    dateAdded: timestamp("date_added").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
}).enableRLS();

export const Deals = pgTable("deals", {
    dealId: uuid("deal_id").primaryKey().defaultRandom(),
    requirementId: uuid("requirement_id").references(
        () => Requirements.requirementId,
        { onDelete: "cascade" }
    ), // The requirement that initiated the deal
    status: dealStages("status").default("open"), // Current status of the deal
    createdAt: timestamp("created_at").defaultNow().notNull(), // When the deal was created
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()), // When the deal was last updated
    paymentPlan: text("payment_plan"), // Store payment plan details related to PHPP
    outstandingAmount: numeric("outstanding_amount", {
        precision: 10,
    }), // Amount that remains to be paid
    milestones: text("milestones"), // Store deal milestones, reference post-handover payments if applicable
    inventoryId: uuid("inventory_id").references(
        () => Inventories.inventoryId,
        { onDelete: "set null" }
    ), // To store the final inventory which was part of the final deal
    remarks: text("remarks"),
}).enableRLS();

export const InventoryAssignedDeals = pgTable("inventory_assigned_deals", {
    id: uuid("id").primaryKey().defaultRandom(),
    dealId: uuid("deal_id").references(() => Deals.dealId, {
        onDelete: "cascade",
    }),
    inventoryId: uuid("inventory_id").references(
        () => Inventories.inventoryId,
        { onDelete: "cascade" }
    ),
    remarks: text("remarks"),
}).enableRLS();

export const NotificationPreferences = pgTable("notification_preferences", {
    userId: uuid("user_id").references(() => Users.userId, {
        onDelete: "cascade",
    }),
    newInventoryNotif: boolean("new_inventory_notif").default(true),
    newRequirementNotif: boolean("new_requirement_notif").default(true),
    pendingRequirementNotif: boolean("pending_requirement_notif").default(true),
    // other notification preferences
}).enableRLS();

// export const ResendMapping = pgTable("resend_mapping", {
//     userId: uuid("user_id").references(() => Users.userId, {
//         onDelete: "cascade",
//     }),
//     resendId: uuid("resend_id"),
// }).enableRLS();

export type InsertUser = typeof Users.$inferInsert;
export type SelectUser = typeof Users.$inferSelect;

export type InsertRequirement = typeof Requirements.$inferInsert;
export type SelectRequirement = typeof Requirements.$inferSelect;

export type InsertInventory = typeof Inventories.$inferInsert;
export type SelectInventory = typeof Inventories.$inferSelect;

export type InsertInventoryAssignedDeals =
    typeof InventoryAssignedDeals.$inferInsert;
export type SelectInventoryAsignedDeals =
    typeof InventoryAssignedDeals.$inferSelect;

export type InsertDeal = typeof Deals.$inferInsert;
export type SelectDeal = typeof Deals.$inferSelect;

export type InsertNotificationPreferences =
    typeof NotificationPreferences.$inferInsert;
export type SelectNotificationPreferences =
    typeof NotificationPreferences.$inferSelect;
