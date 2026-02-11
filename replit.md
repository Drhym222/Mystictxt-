# MysticTxt - Psychic Services Website

## Overview
MysticTxt is a production-ready psychic services website that markets and sells psychic readings, telepathy mind reading, and mind implant services. Features include service browsing, checkout, order intake, live psychic chat with credit-based wallet system, client authentication and account dashboard, and a full admin portal for managing services, orders, refunds, content, and live sessions.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter with useLocation-based conditional rendering (not nested Switch)
- **State**: TanStack React Query with polling for live chat
- **Payments**: Prepared for Stripe + PayPal (keys needed)

## Site Structure
### Auth Pages (standalone, no layout wrapper)
- `/auth/login` - Client login (email + password)
- `/auth/register` - Client registration (name, email, password)

### Public Pages
- `/` - Home page with hero, trust badges, featured services, testimonials, CTA
- `/services` - Services listing grid
- `/services/:slug` - Service detail page
- `/checkout?service=slug` - Checkout page with Stripe/PayPal options
- `/order/:id` - Order intake form (post-purchase)
- `/live` - Live chat info & pricing page
- `/account` - Client account dashboard with wallet/credits, chat sessions, links to sub-pages
- `/account/wallet` - Dedicated wallet management page (add credits, view transactions)
- `/account/orders` - Client order history page
- `/chat/:sessionId` - Live timed chat session with grace period modal
- `/faq` - FAQ page with accordion
- `/contact` - Contact form
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Admin Pages
- `/admin/login` - Admin login (email: admin@mystictxt.com, password: admin123)
- `/admin/dashboard` - Stats overview with order stats, chat stats, pending alerts, recent orders
- `/admin/services` - CRUD service management
- `/admin/orders` - Order management with status updates, cancel and refund capabilities
- `/admin/live-sessions` - Live chat: incoming requests, accept sessions, real-time chat with clients
- `/admin/refunds` - Dedicated refund management (eligible orders, refunded, cancelled)
- `/admin/content` - Testimonials & FAQ CRUD management

## Database Schema
- `users` - Admin users (id, email, password_hash, role)
- `clients` - Client users (id, email, password_hash, name, created_at)
- `services` - Service listings (slug, title, descriptions, price, delivery, includes, requirements)
- `orders` - Customer orders (service_id, email, status [pending/in_progress/delivered/cancelled/refunded], payment info)
- `order_intake` - Reading details submitted by customers
- `testimonials` - Customer testimonials
- `faq_items` - FAQ questions and answers
- `wallets` - Customer wallets (customer_email, balance_cents)
- `wallet_transactions` - Credit/debit transaction ledger (wallet_id, amount, type, description)
- `chat_sessions` - Live chat sessions (customer_email, status [pending/active/ended], duration, credits_used, timing)
- `chat_messages` - Chat messages (session_id, sender_role [customer/psychic/system], content)

## API Routes
### Client Auth
- `POST /api/auth/register` - Register new client (name, email, password)
- `POST /api/auth/login` - Client login
- `POST /api/auth/logout` - Client logout
- `GET /api/auth/me` - Current logged-in client

### Public
- `GET /api/services` - List active services
- `GET /api/services/:slug` - Get service by slug
- `GET /api/testimonials` - List active testimonials
- `GET /api/faq` - List active FAQs
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/intake` - Submit reading details
- `GET /api/wallet?email=x` - Get wallet and transactions
- `POST /api/wallet/add-credits` - Add credits to wallet (uses session email if logged in)
- `GET /api/account` - Get full account data (requires client auth)
- `GET /api/client/orders` - Get client's order history (requires client auth)
- `POST /api/chat/sessions` - Start new chat session (creates as "pending", deducts credits)
- `GET /api/chat/sessions/:id` - Get session status (auto-expires active sessions)
- `GET /api/chat/sessions/:id/messages` - Get messages (supports sinceId polling)
- `POST /api/chat/sessions/:id/messages` - Send customer message (only when session is active)

### Admin (all require auth)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Current admin user
- `GET /api/admin/stats` - Dashboard stats (orders, revenue, chat metrics)
- CRUD: `/api/admin/services`
- CRUD: `/api/admin/orders` (supports cancelled/refunded statuses)
- CRUD: `/api/admin/testimonials` (with Zod validation)
- CRUD: `/api/admin/faq` (with Zod validation)
- `GET /api/admin/live-sessions` - List all chat sessions
- `GET /api/admin/live-sessions/:id` - Get single session (admin-protected)
- `PATCH /api/admin/live-sessions/:id` - Update session status
- `POST /api/admin/live-sessions/:id/accept` - Accept pending session (sets active + startedAt)
- `GET /api/admin/live-sessions/:id/messages` - Get session messages
- `POST /api/admin/live-sessions/:id/messages` - Send message as psychic/advisor

## Design
- Dark mystical theme with purple/indigo accent colors
- Font: Plus Jakarta Sans (sans), Playfair Display (serif)
- Default dark mode with light mode toggle
- Generated images for service cards (crystal-ball, third-eye, mind-implant)

## Client Authentication
- Separate from admin auth (uses `clients` table, not `users`)
- Session-based with clientId and clientEmail stored in session
- Protected routes: /account, /account/wallet, /account/orders redirect to /auth/login if not authenticated
- Header nav shows Sign In link or user name + Sign Out based on auth state

## Live Chat System
- Credit-based: $2.99/minute, customers buy credits via wallet
- Real admin-client chat: Client creates session (pending), admin sees notification badge, accepts, then both chat in real time
- Polling-based: React Query polls messages every 2 seconds during active sessions
- Auto-expiry: Sessions auto-expire based on duration purchased (timer starts when admin accepts)
- Timer display: Countdown timer with color-coded urgency on both admin and client sides
- Grace period modal: Warning dialog appears when less than 1 minute remains
- System messages: Used for status updates (session created, advisor connected)

## Recent Changes
- Feb 2026: Initial MVP build with all pages, admin portal, database seeding
- Feb 2026: Added Live Chat system, Client Account/Wallet, Admin Content Management, Admin Live Sessions
- Feb 2026: Fixed routing, input validation, Zod validation on all PATCH routes
- Feb 2026: Transformed live chat from auto-responses to real admin-client chat with accept flow
- Feb 2026: Added order cancel/refund capabilities, enhanced admin dashboard with chat stats and recent orders
- Feb 2026: Added notification badge in admin sidebar for pending chat requests
- Feb 2026: Added client authentication (register/login), account sub-pages (wallet, orders), admin refunds page, grace period modal for chat
