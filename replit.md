# MysticTxt - Psychic Services Website

## Overview
MysticTxt is a production-ready psychic services website that markets and sells psychic readings, telepathy mind reading, and mind implant services. Features include service browsing, checkout, order intake, live psychic chat with credit-based wallet system, client account dashboard, and a full admin portal for managing services, orders, content, and live sessions.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter with useLocation-based conditional rendering (not nested Switch)
- **State**: TanStack React Query with polling for live chat
- **Payments**: Prepared for Stripe + PayPal (keys needed)

## Site Structure
### Public Pages
- `/` - Home page with hero, trust badges, featured services, testimonials, CTA
- `/services` - Services listing grid
- `/services/:slug` - Service detail page
- `/checkout?service=slug` - Checkout page with Stripe/PayPal options
- `/order/:id` - Order intake form (post-purchase)
- `/live` - Live chat info & pricing page
- `/account` - Client account dashboard with wallet/credits and chat session management
- `/chat/:sessionId` - Live timed chat session with psychic
- `/faq` - FAQ page with accordion
- `/contact` - Contact form
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Admin Pages
- `/admin/login` - Admin login (email: admin@mystictxt.com, password: admin123)
- `/admin/dashboard` - Stats overview
- `/admin/services` - CRUD service management
- `/admin/orders` - Order management with status updates
- `/admin/live-sessions` - Live chat session monitoring and management
- `/admin/content` - Testimonials & FAQ CRUD management

## Database Schema
- `users` - Admin users (id, email, password_hash, role)
- `services` - Service listings (slug, title, descriptions, price, delivery, includes, requirements)
- `orders` - Customer orders (service_id, email, status, payment info)
- `order_intake` - Reading details submitted by customers
- `testimonials` - Customer testimonials
- `faq_items` - FAQ questions and answers
- `wallets` - Customer wallets (customer_email, balance_cents)
- `wallet_transactions` - Credit/debit transaction ledger (wallet_id, amount, type, description)
- `chat_sessions` - Live chat sessions (customer_email, status, duration, credits_used, timing)
- `chat_messages` - Chat messages (session_id, sender_role, content)

## API Routes
### Public
- `GET /api/services` - List active services
- `GET /api/services/:slug` - Get service by slug
- `GET /api/testimonials` - List active testimonials
- `GET /api/faq` - List active FAQs
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/intake` - Submit reading details
- `GET /api/wallet?email=x` - Get wallet and transactions
- `POST /api/wallet/add-credits` - Add credits to wallet
- `GET /api/account?email=x` - Get full account data (wallet, transactions, sessions)
- `POST /api/chat/sessions` - Start new chat session (deducts credits)
- `GET /api/chat/sessions/:id` - Get session status (auto-expires)
- `GET /api/chat/sessions/:id/messages` - Get messages (supports sinceId polling)
- `POST /api/chat/sessions/:id/messages` - Send message (server forces senderRole=customer)

### Admin (all require auth)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Current admin user
- `GET /api/admin/stats` - Dashboard stats
- CRUD: `/api/admin/services`
- CRUD: `/api/admin/orders`
- CRUD: `/api/admin/testimonials` (with Zod validation)
- CRUD: `/api/admin/faq` (with Zod validation)
- GET/PATCH: `/api/admin/live-sessions` (with Zod validation)

## Design
- Dark mystical theme with purple/indigo accent colors
- Font: Plus Jakarta Sans (sans), Playfair Display (serif)
- Default dark mode with light mode toggle
- Generated images for service cards (crystal-ball, third-eye, mind-implant)

## Live Chat System
- Credit-based: $2.99/minute, customers buy credits via wallet
- Polling-based: React Query polls messages every 2 seconds during active sessions
- Auto-expiry: Sessions auto-expire based on duration purchased
- Auto-responses: Server generates simulated psychic responses after customer messages
- Timer display: Countdown timer with color-coded urgency

## Recent Changes
- Feb 2026: Initial MVP build with all pages, admin portal, database seeding
- Feb 2026: Added Live Chat system, Client Account/Wallet, Admin Content Management, Admin Live Sessions
- Feb 2026: Fixed routing (useLocation-based instead of nested Switch), added input validation, Zod validation on all PATCH routes, server-enforced senderRole on chat messages
