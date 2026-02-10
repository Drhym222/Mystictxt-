import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import {
  users, services, orders, orderIntake, testimonials, faqItems,
  type InsertUser, type User,
  type InsertService, type Service,
  type InsertOrder, type Order,
  type InsertOrderIntake, type OrderIntake,
  type InsertTestimonial, type Testimonial,
  type InsertFaq, type FaqItem,
} from "@shared/schema";

export interface IStorage {
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getServices(activeOnly?: boolean): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, data: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  getOrders(): Promise<(Order & { serviceTitle?: string })[]>;
  getOrderById(id: number): Promise<(Order & { intakeSubmitted?: boolean }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;

  createOrderIntake(intake: InsertOrderIntake): Promise<OrderIntake>;
  getOrderIntakeByOrderId(orderId: number): Promise<OrderIntake | undefined>;

  getTestimonials(activeOnly?: boolean): Promise<Testimonial[]>;
  createTestimonial(t: InsertTestimonial): Promise<Testimonial>;

  getFaqs(activeOnly?: boolean): Promise<FaqItem[]>;
  createFaq(f: InsertFaq): Promise<FaqItem>;

  getStats(): Promise<{ totalOrders: number; totalRevenue: number; pendingOrders: number; deliveredOrders: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getServices(activeOnly = false): Promise<Service[]> {
    if (activeOnly) {
      return db.select().from(services).where(eq(services.active, true));
    }
    return db.select().from(services);
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: number, data: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getOrders(): Promise<(Order & { serviceTitle?: string })[]> {
    const result = await db
      .select({
        id: orders.id,
        serviceId: orders.serviceId,
        customerEmail: orders.customerEmail,
        status: orders.status,
        paymentProvider: orders.paymentProvider,
        paymentStatus: orders.paymentStatus,
        amountCents: orders.amountCents,
        currency: orders.currency,
        stripeSessionId: orders.stripeSessionId,
        createdAt: orders.createdAt,
        serviceTitle: services.title,
      })
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .orderBy(desc(orders.createdAt));
    return result;
  }

  async getOrderById(id: number): Promise<(Order & { intakeSubmitted?: boolean }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;
    const intake = await this.getOrderIntakeByOrderId(id);
    return { ...order, intakeSubmitted: !!intake };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    return created;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated;
  }

  async createOrderIntake(intake: InsertOrderIntake): Promise<OrderIntake> {
    const [created] = await db.insert(orderIntake).values(intake).returning();
    return created;
  }

  async getOrderIntakeByOrderId(orderId: number): Promise<OrderIntake | undefined> {
    const [intake] = await db.select().from(orderIntake).where(eq(orderIntake.orderId, orderId));
    return intake;
  }

  async getTestimonials(activeOnly = false): Promise<Testimonial[]> {
    if (activeOnly) {
      return db.select().from(testimonials).where(eq(testimonials.active, true));
    }
    return db.select().from(testimonials);
  }

  async createTestimonial(t: InsertTestimonial): Promise<Testimonial> {
    const [created] = await db.insert(testimonials).values(t).returning();
    return created;
  }

  async getFaqs(activeOnly = false): Promise<FaqItem[]> {
    if (activeOnly) {
      return db.select().from(faqItems).where(eq(faqItems.active, true)).orderBy(faqItems.sortOrder);
    }
    return db.select().from(faqItems).orderBy(faqItems.sortOrder);
  }

  async createFaq(f: InsertFaq): Promise<FaqItem> {
    const [created] = await db.insert(faqItems).values(f).returning();
    return created;
  }

  async getStats() {
    const allOrders = await db.select().from(orders);
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.amountCents, 0);
    const pendingOrders = allOrders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered").length;
    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  }
}

export const storage = new DatabaseStorage();
