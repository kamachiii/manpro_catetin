# PROJECT_RULES.md

## General Rule

All implementation must follow these documents:

- docs/DESIGN.md
- docs/SITEMAP.md
- docs/PRODUCT.md
- docs/DATABASE.md
- docs/ARCHITECTURE.md
- docs/TASKS.md
- IMPLEMENTATION_PLAN.md

These documents are the single source of truth.

Do not invent features outside the MVP scope.

---

## Tech Stack Rules

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Vercel deployment

Do not use:

- JavaScript files
- Prisma
- Firebase
- MongoDB
- Redux
- Zustand
- Express.js backend
- Laravel
- Payment gateway
- Realtime notification
- AI summary feature

---

## Development Rules

- Implement one milestone at a time.
- Do not implement future milestones unless explicitly requested.
- Stop after finishing the requested milestone.
- Generate a progress report after every milestone.
- Do not rewrite existing documentation unless requested.
- Do not change the database schema without explaining why.
- Do not add new tables unless requested.
- Do not add new features outside the MVP.

---

## Database Rules

- Supabase is the source of truth.
- Never manipulate `coin_balance` directly from client components.
- Coin updates must use secure server logic or PostgreSQL RPC.
- Note approval must use transactional logic.
- Top up approval must use transactional logic.
- Note download must validate coin balance before file access.
- `notes-files` bucket must be private.
- `topup-proofs` bucket must be private.
- `avatars` bucket may be public.

---

## Auth & Role Rules

- Default registered user role is `user`.
- Admin role must not be assigned from the register form.
- Admin role must be assigned manually from Supabase/database.
- `/dashboard/*` requires authenticated user.
- `/admin/*` requires admin role.
- Guest cannot download notes.
- Guest cannot comment.
- Guest cannot upload notes.

---

## UI Rules

- Follow DESIGN.md strictly.
- Use clean modern SaaS UI.
- Use primary color `#2563EB`.
- Use background `#F9FAFB`.
- Use Inter font.
- Use card-based layout.
- Use responsive design.
- Avoid excessive gradients.
- Avoid glassmorphism.
- Avoid neumorphism.
- Avoid heavy animations.

---

## MVP Scope

Only implement:

- Login
- Register
- Logout
- Public note browsing
- Note detail and preview
- Student dashboard
- Upload note
- Admin note verification
- Coin system
- Top up manual
- Comment system
- Admin dashboard
- Category, semester, and course management
- Basic statistics

Do not implement:

- Bookmark
- Rating
- Chat
- Follow user
- Realtime notification
- AI summary
- Payment gateway
- Mobile app
- Report system
- Gamification
