import { db } from "./db";
import { eq, desc, sql, and, gt, asc } from "drizzle-orm";
import {
  users, services, orders, orderIntake, testimonials, faqItems,
  wallets, walletTransactions, chatSessions, chatMessages, clients,
  type InsertUser, type User,
  type InsertService, type Service,
  type InsertOrder, type Order,
  type InsertOrderIntake, type OrderIntake,
  type InsertTestimonial, type Testimonial,
  type InsertFaq, type FaqItem,
  type InsertWallet, type Wallet,
  type InsertWalletTransaction, type WalletTransaction,
  type InsertChatSession, type ChatSession,
  type InsertChatMessage, type ChatMessage,
  type InsertClient, type Client,
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
  updateTestimonial(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: number): Promise<void>;

  getFaqs(activeOnly?: boolean): Promise<FaqItem[]>;
  createFaq(f: InsertFaq): Promise<FaqItem>;
  updateFaq(id: number, data: Partial<InsertFaq>): Promise<FaqItem | undefined>;
  deleteFaq(id: number): Promise<void>;

  getWalletByEmail(email: string): Promise<Wallet | undefined>;
  getOrCreateWallet(email: string): Promise<Wallet>;
  updateWalletBalance(id: number, amountCents: number): Promise<Wallet | undefined>;
  getWalletTransactions(walletId: number): Promise<WalletTransaction[]>;
  createWalletTransaction(t: InsertWalletTransaction): Promise<WalletTransaction>;

  getChatSessions(email?: string): Promise<ChatSession[]>;
  getChatSessionById(id: number): Promise<ChatSession | undefined>;
  createChatSession(s: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, data: Partial<ChatSession>): Promise<ChatSession | undefined>;
  getAllChatSessions(): Promise<ChatSession[]>;

  getChatMessages(sessionId: number, sinceId?: number): Promise<ChatMessage[]>;
  createChatMessage(m: InsertChatMessage): Promise<ChatMessage>;

  getClientByEmail(email: string): Promise<Client | undefined>;
  getClientById(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  getOrdersByEmail(email: string): Promise<(Order & { serviceTitle?: string })[]>;

  getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    activeSessions: number;
    pendingSessions: number;
    totalChatRevenue: number;
  }>;
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
    const [created] = await db.insert(services).values(service as any).returning();
    return created;
  }

  async updateService(id: number, data: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(data as any).where(eq(services.id, id)).returning();
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
    return result.map((r) => ({ ...r, serviceTitle: r.serviceTitle ?? undefined }));
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

  async updateTestimonial(id: number, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updated] = await db.update(testimonials).set(data).where(eq(testimonials.id, id)).returning();
    return updated;
  }

  async deleteTestimonial(id: number): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
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

  async updateFaq(id: number, data: Partial<InsertFaq>): Promise<FaqItem | undefined> {
    const [updated] = await db.update(faqItems).set(data).where(eq(faqItems.id, id)).returning();
    return updated;
  }

  async deleteFaq(id: number): Promise<void> {
    await db.delete(faqItems).where(eq(faqItems.id, id));
  }

  async getWalletByEmail(email: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.customerEmail, email));
    return wallet;
  }

  async getOrCreateWallet(email: string): Promise<Wallet> {
    const existing = await this.getWalletByEmail(email);
    if (existing) return existing;
    const [created] = await db.insert(wallets).values({ customerEmail: email, balanceCents: 0 }).returning();
    return created;
  }

  async updateWalletBalance(id: number, amountCents: number): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({ balanceCents: sql`${wallets.balanceCents} + ${amountCents}` })
      .where(eq(wallets.id, id))
      .returning();
    return updated;
  }

  async getWalletTransactions(walletId: number): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt));
  }

  async createWalletTransaction(t: InsertWalletTransaction): Promise<WalletTransaction> {
    const [created] = await db.insert(walletTransactions).values(t).returning();
    return created;
  }

  async getChatSessions(email?: string): Promise<ChatSession[]> {
    if (email) {
      return db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.customerEmail, email))
        .orderBy(desc(chatSessions.createdAt));
    }
    return db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  }

  async getChatSessionById(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async createChatSession(s: InsertChatSession): Promise<ChatSession> {
    const [created] = await db.insert(chatSessions).values(s).returning();
    return created;
  }

  async updateChatSession(id: number, data: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updated] = await db.update(chatSessions).set(data).where(eq(chatSessions.id, id)).returning();
    return updated;
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    return db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
  }

  async getChatMessages(sessionId: number, sinceId?: number): Promise<ChatMessage[]> {
    if (sinceId) {
      return db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.sessionId, sessionId), gt(chatMessages.id, sinceId)))
        .orderBy(asc(chatMessages.createdAt));
    }
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(m: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(m).returning();
    return created;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client;
  }

  async getClientById(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async getOrdersByEmail(email: string): Promise<(Order & { serviceTitle?: string })[]> {
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
      .where(eq(orders.customerEmail, email))
      .orderBy(desc(orders.createdAt));
    return result.map((r) => ({ ...r, serviceTitle: r.serviceTitle ?? undefined }));
  }

  async getStats() {
    const allOrders = await db.select().from(orders);
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === "paid" && o.status !== "refunded")
      .reduce((sum, o) => sum + o.amountCents, 0);
    const pendingOrders = allOrders.filter((o) => o.status === "pending" || o.status === "in_progress").length;
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled").length;
    const refundedOrders = allOrders.filter((o) => o.status === "refunded").length;

    const allSessions = await db.select().from(chatSessions);
    const activeSessions = allSessions.filter((s) => s.status === "active").length;
    const pendingSessions = allSessions.filter((s) => s.status === "pending").length;
    const totalChatRevenue = allSessions
      .filter((s) => s.status !== "pending")
      .reduce((sum, s) => sum + s.creditsUsedCents, 0);

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      activeSessions,
      pendingSessions,
      totalChatRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
