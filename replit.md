# MysticTxt - Psychic Services Website

## Overview
MysticTxt is a production-ready psychic services website that markets and sells psychic readings, telepathy mind reading, and mind implant services. Customers browse services, purchase via checkout, and submit their reading details through an order intake form. An admin portal manages services, orders, and content.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui components
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express routes (backend)
- **State**: TanStack React Query
- **Payments**: Prepared for Stripe + PayPal (keys needed)

## Site Structure
### Public Pages
- `/` - Home page with hero, trust badges, featured services, testimonials, CTA
- `/services` - Services listing grid
- `/services/:slug` - Service detail page
- `/checkout?service=slug` - Checkout page with Stripe/PayPal options
- `/order/:id` - Order intake form (post-purchase)
- `/faq` - FAQ page with accordion
- `/contact` - Contact form
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy

### Admin Pages
- `/admin/login` - Admin login (email: admin@mystictxt.com, password: admin123)
- `/admin/dashboard` - Stats overview
- `/admin/services` - CRUD service management
- `/admin/orders` - Order management with status updates

## Database Schema
- `users` - Admin users (id, email, password_hash, role)
- `services` - Service listings (slug, title, descriptions, price, delivery, includes, requirements)
- `orders` - Customer orders (service_id, email, status, payment info)
- `order_intake` - Reading details submitted by customers
- `testimonials` - Customer testimonials
- `faq_items` - FAQ questions and answers

## API Routes
- `GET /api/services` - List active services
- `GET /api/services/:slug` - Get service by slug
- `GET /api/testimonials` - List active testimonials
- `GET /api/faq` - List active FAQs
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/intake` - Submit reading details
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Current admin user
- `GET /api/admin/stats` - Dashboard stats
- CRUD: `/api/admin/services`, `/api/admin/orders`

## Design
- Dark mystical theme with purple/indigo accent colors
- Font: Plus Jakarta Sans (sans), Playfair Display (serif)
- Default dark mode with light mode toggle
- Generated images for service cards (crystal-ball, third-eye, mind-implant)

## Recent Changes
- Feb 2026: Initial MVP build with all pages, admin portal, database seeding
