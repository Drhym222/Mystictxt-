import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import { insertServiceSchema, insertOrderIntakeSchema } from "@shared/schema";
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
  status: z.enum(["pending", "in_progress", "delivered"]),
});

const intakeBodySchema = z.object({
  fullName: z.string().min(2),
  dob: z.string().nullable().optional(),
  question: z.string().min(10),
  details: z.record(z.string()).optional().default({}),
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
    const testimonials = await storage.getTestimonials(true);
    res.json(testimonials);
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
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
    const order = await storage.getOrderById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  });

  app.post("/api/orders/:id/intake", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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
      const id = parseInt(req.params.id);
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

  return httpServer;
}
