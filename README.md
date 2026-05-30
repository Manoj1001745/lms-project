<<<<<<< HEAD
## LearningHun LMS

Monorepo for the **LearningHun** enterprise LMS platform.

- `backend/` – Laravel 12 REST API (admin + user), MySQL, Redis, queues, Reverb, payments.
- `frontend/` – Next.js 15 App Router SPA/MPA with TypeScript, Tailwind, Shadcn UI, and premium SaaS UI.

Brand colors:

- Primary blue: `#2563EB`
- Accent yellow: `#FACC15`
- Success green: `#16A34A`

## What is scaffolded now

- Separate API domains:
  - `POST /api/v1/admin/login`
  - `GET /api/v1/admin/dashboard`
  - `POST /api/v1/admin/logout`
  - `POST /api/v1/user/register`
  - `POST /api/v1/user/login`
  - `GET /api/v1/user/dashboard`
  - `POST /api/v1/user/logout`
- Separate route groups and pages:
  - `frontend/app/admin/*` for admin
  - `frontend/app/(auth)/*` and `frontend/app/dashboard` for users
- Starter RBAC tables: `roles`, `admins`, `users.role_id`
- Sanctum token authentication
- Docker and GitHub Actions CI baseline

## Local setup

### Backend

1. `cd backend`
2. `composer install`
3. `php artisan migrate:fresh --seed`
4. `php artisan serve`

Seeded credentials:

- Super Admin: `superadmin@learninghun.com` / `Password@123`
- Student: `student@learninghun.com` / `Password@123`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Docker setup

Run from repo root:

- `docker compose up --build`

## Stripe local webhook setup

1. Set backend env values:
   - `STRIPE_SECRET=...`
   - `STRIPE_WEBHOOK_SECRET=...`
   - `FRONTEND_URL=http://localhost:3000`
2. Run backend: `cd backend && php artisan serve`
3. In another terminal, start Stripe webhook forwarding:
   - `stripe listen --forward-to http://localhost:8000/api/v1/payments/webhook/stripe`
4. Copy the webhook signing secret shown by Stripe CLI and set it as `STRIPE_WEBHOOK_SECRET`.
5. Trigger test events:
   - `stripe trigger checkout.session.completed`

Webhook route used by this project:

- `POST /api/v1/payments/webhook/stripe`


=======
# lms-project
>>>>>>> 91641289ea9dd35e30461b8366fa5833276fdaf7
