import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  longDesc: text("long_desc").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  deliveryHours: integer("delivery_hours").notNull(),
  includes: jsonb("includes").$type<string[]>().notNull().default([]),
  requirements: jsonb("requirements").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  status: text("status").notNull().default("pending"),
  paymentProvider: text("payment_provider"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderIntake = pgTable("order_intake", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  fullName: text("full_name").notNull(),
  dob: text("dob"),
  question: text("question").notNull(),
  details: jsonb("details").$type<Record<string, string>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull().default(5),
  active: boolean("active").notNull().default(true),
});

export const faqItems = pgTable("faq_items", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderIntakeSchema = createInsertSchema(orderIntake).omit({ id: true, createdAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertFaqSchema = createInsertSchema(faqItems).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderIntake = z.infer<typeof insertOrderIntakeSchema>;
export type OrderIntake = typeof orderIntake.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type FaqItem = typeof faqItems.$inferSelect;
