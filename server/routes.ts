import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertServiceSchema, insertOrderIntakeSchema, insertTestimonialSchema, insertFaqSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";
import MemoryStore from "memorystore";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

const createOrderSchema = z.object({
  email: z.string().email("Valid email required"),
  serviceId: z.number().int().positive(),
  paymentProvider: z.enum(["stripe", "paypal"]).optional().default("stripe"),
});

const updateOrderSchema = z.object({
  status: z.enum(["pending", "in_progress", "delivered", "cancelled", "refunded"]),
});

const intakeBodySchema = z.object({
  fullName: z.string().min(2),
  dob: z.string().nullable().optional(),
  question: z.string().min(10),
  details: z.record(z.string()).optional().default({}),
});

const addCreditsSchema = z.object({
  email: z.string().email(),
  amountCents: z.number().int().positive(),
});

const startChatSchema = z.object({
  email: z.string().email(),
  durationMinutes: z.number().int().min(5).max(60).default(10),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

const updateTestimonialSchema = z.object({
  name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  active: z.boolean().optional(),
});

const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

const updateChatSessionSchema = z.object({
  status: z.enum(["active", "ended", "pending"]).optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const SessionStore = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "mystictxt-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({ checkPeriod: 86400000 }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  await seedDatabase();

  app.get("/api/services", async (_req, res) => {
    const svcs = await storage.getServices(true);
    res.json(svcs);
  });

  app.get("/api/services/:slug", async (req, res) => {
    const service = await storage.getServiceBySlug(req.params.slug);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.get("/api/testimonials", async (_req, res) => {
    const t = await storage.getTestimonials(true);
    res.json(t);
  });

  app.get("/api/faq", async (_req, res) => {
    const faqs = await storage.getFaqs(true);
    res.json(faqs);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { email, serviceId, paymentProvider } = parsed.data;

      const service = await storage.getServiceById(serviceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      const order = await storage.createOrder({
        serviceId: service.id,
        customerEmail: email,
        status: "pending",
        paymentProvider,
        paymentStatus: "paid",
        amountCents: service.priceCents,
        currency: service.currency,
      });

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
    const order = await storage.getOrderById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post("/api/orders/:id/intake", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id as string);
      if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const existing = await storage.getOrderIntakeByOrderId(orderId);
      if (existing) return res.status(400).json({ message: "Intake already submitted" });

      const parsed = intakeBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const intake = await storage.createOrderIntake({
        orderId,
        fullName: parsed.data.fullName,
        dob: parsed.data.dob || null,
        question: parsed.data.question,
        details: parsed.data.details,
      });

      res.json(intake);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to submit intake" });
    }
  });

  app.get("/api/wallet", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wallet = await storage.getOrCreateWallet(email);
      const transactions = await storage.getWalletTransactions(wallet.id);
      res.json({ wallet, transactions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wallet/add-credits", async (req, res) => {
    try {
      const parsed = addCreditsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const wallet = await storage.getOrCreateWallet(parsed.data.email);
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amountCents: parsed.data.amountCents,
        type: "credit",
        description: `Added $${(parsed.data.amountCents / 100).toFixed(2)} credits`,
      });
      const updated = await storage.updateWalletBalance(wallet.id, parsed.data.amountCents);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/account", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const wallet = await storage.getOrCreateWallet(email);
      const transactions = await storage.getWalletTransactions(wallet.id);
      const sessions = await storage.getChatSessions(email);
      res.json({ wallet, transactions, sessions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const parsed = startChatSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const costPerMinute = 299;
      const totalCost = costPerMinute * parsed.data.durationMinutes;

      const wallet = await storage.getOrCreateWallet(parsed.data.email);
      if (wallet.balanceCents < totalCost) {
        return res.status(400).json({
          message: "Insufficient credits",
          required: totalCost,
          available: wallet.balanceCents,
        });
      }

      await storage.updateWalletBalance(wallet.id, -totalCost);
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amountCents: -totalCost,
        type: "debit",
        description: `Live chat session - ${parsed.data.durationMinutes} minutes`,
      });

      const session = await storage.createChatSession({
        customerEmail: parsed.data.email,
        status: "pending",
        durationMinutes: parsed.data.durationMinutes,
        creditsUsedCents: totalCost,
      });

      await storage.createChatMessage({
        sessionId: session.id,
        senderRole: "system",
        content: "Your session request has been submitted. Please wait while an advisor connects with you.",
      });

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const session = await storage.getChatSessionById(id);
      if (!session) return res.status(404).json({ message: "Session not found" });

      if (session.status === "active" && session.startedAt) {
        const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60;
        if (elapsed >= session.durationMinutes) {
          await storage.updateChatSession(id, { status: "ended", endedAt: new Date() });
          session.status = "ended";
          session.endedAt = new Date();
        }
      }

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/chat/sessions/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid session ID" });
      const sinceId = req.query.sinceId ? parseInt(req.query.sinceId as string) : undefined;
      const messages = await storage.getChatMessages(id, sinceId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/chat/sessions/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id as string);
      if (isNaN(sessionId)) return res.status(400).json({ message: "Invalid session ID" });

      const session = await storage.getChatSessionById(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });

      if (session.status !== "active") {
        return res.status(400).json({ message: "Session is not active yet. Please wait for an advisor to connect." });
      }

      if (session.startedAt) {
        const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60;
        if (elapsed >= session.durationMinutes) {
          await storage.updateChatSession(sessionId, { status: "ended", endedAt: new Date() });
          return res.status(400).json({ message: "Session has expired" });
        }
      }

      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const message = await storage.createChatMessage({
        sessionId,
        senderRole: "customer",
        content: parsed.data.content,
      });

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, email: user.email, role: user.role });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/admin/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: user.id, email: user.email, role: user.role });
  });

  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/admin/services", requireAdmin, async (_req, res) => {
    const svcs = await storage.getServices();
    res.json(svcs);
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const parsed = insertServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid service data" });
      }
      const service = await storage.createService(parsed.data);
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });
      const existing = await storage.getServiceById(id);
      if (!existing) return res.status(404).json({ message: "Service not found" });
      const service = await storage.updateService(id, req.body);
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid service ID" });
      await storage.deleteService(id);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    const allOrders = await storage.getOrders();
    res.json(allOrders);
  });

  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
      const parsed = updateOrderSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid status" });
      }
      const order = await storage.updateOrder(id, { status: parsed.data.status });
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/testimonials", requireAdmin, async (_req, res) => {
    const all = await storage.getTestimonials();
    res.json(all);
  });

  app.post("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try {
      const parsed = insertTestimonialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const created = await storage.createTestimonial(parsed.data);
      res.json(created);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const parsed = updateTestimonialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const updated = await storage.updateTestimonial(id, parsed.data);
      if (!updated) return res.status(404).json({ message: "Testimonial not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteTestimonial(id);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/faq", requireAdmin, async (_req, res) => {
    const all = await storage.getFaqs();
    res.json(all);
  });

  app.post("/api/admin/faq", requireAdmin, async (req, res) => {
    try {
      const parsed = insertFaqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const created = await storage.createFaq(parsed.data);
      res.json(created);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const parsed = updateFaqSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const updated = await storage.updateFaq(id, parsed.data);
      if (!updated) return res.status(404).json({ message: "FAQ not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/faq/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      await storage.deleteFaq(id);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/live-sessions", requireAdmin, async (_req, res) => {
    const all = await storage.getAllChatSessions();
    res.json(all);
  });

  app.patch("/api/admin/live-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const parsed = updateChatSessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const updateData: Record<string, any> = { ...parsed.data };
      if (parsed.data.status === "ended") {
        updateData.endedAt = new Date();
      }
      const updated = await storage.updateChatSession(id, updateData);
      if (!updated) return res.status(404).json({ message: "Session not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/live-sessions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const session = await storage.getChatSessionById(id);
      if (!session) return res.status(404).json({ message: "Session not found" });

      if (session.status === "active" && session.startedAt) {
        const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60;
        if (elapsed >= session.durationMinutes) {
          await storage.updateChatSession(id, { status: "ended", endedAt: new Date() });
          session.status = "ended";
          session.endedAt = new Date();
        }
      }

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/live-sessions/:id/accept", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const session = await storage.getChatSessionById(id);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.status !== "pending") {
        return res.status(400).json({ message: "Session is not pending" });
      }

      const updated = await storage.updateChatSession(id, {
        status: "active",
        startedAt: new Date(),
      });

      await storage.createChatMessage({
        sessionId: id,
        senderRole: "psychic",
        content: "An advisor has connected to your session. How can I guide you today?",
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/live-sessions/:id/messages", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const sinceId = req.query.sinceId ? parseInt(req.query.sinceId as string) : undefined;
      const messages = await storage.getChatMessages(id, sinceId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/live-sessions/:id/messages", requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id as string);
      if (isNaN(sessionId)) return res.status(400).json({ message: "Invalid ID" });

      const session = await storage.getChatSessionById(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });
      if (session.status !== "active") {
        return res.status(400).json({ message: "Session is not active" });
      }

      if (session.startedAt) {
        const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60;
        if (elapsed >= session.durationMinutes) {
          await storage.updateChatSession(sessionId, { status: "ended", endedAt: new Date() });
          return res.status(400).json({ message: "Session has expired" });
        }
      }

      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
      }

      const message = await storage.createChatMessage({
        sessionId,
        senderRole: "psychic",
        content: parsed.data.content,
      });

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
