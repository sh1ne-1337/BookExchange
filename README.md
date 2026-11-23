# Bookswap — book exchange service

A web application where readers share their own books, browse books of other users and request
an exchange. The book owner receives an email with the requester's contact details and the list of
books they can offer.

**Stack:** React · TypeScript · Tailwind CSS · Express · TypeORM · PostgreSQL

## Features

| Area             | What's implemented                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth             | Register / login with JWT, session persisted in `localStorage`, auto-logout on expired token, rate limiting on auth endpoints                                                  |
| My books         | List, add, edit and delete own books; cover photo as **file upload** (drag & drop, preview) **or URL**                                                                         |
| Books            | Search by title or author, alphabetical sorting (title/author, A→Z / Z→A) and "recently added", **server-side pagination**; filters are kept in the URL                        |
| Book details     | Cover, author, owner, date; "Request exchange" button                                                                                                                          |
| Exchange request | Dialog previews the books you will offer → email to the owner (name, email, your books, `Reply-To` set to you). Requests for your own book and duplicate requests are rejected |
| Roles            | **Admin:** users CRUD (`/admin`), delete any book. **User:** CRUD of own books, send/receive requests. Checked on the server, mirrored in the UI                               |
| Profile (extra)  | Edit name, email and avatar; books count; list of incoming exchange requests                                                                                                   |
| Forgot password  | Reset link sent by email (single-use, expires in 1 hour, token stored hashed)                                                                                                  |

## Getting started

**Requirements:** Node.js 22.12+ or 24 (`nvm use` picks the version from `.nvmrc`), Docker, an AWS S3
bucket.

```bash
# 1. Start PostgreSQL and Mailpit (local SMTP server with a web inbox)
docker compose up -d

# 2. Install dependencies of both apps
npm run setup

# 3. Configure the API: set your own JWT_SECRET and your S3 bucket (see "Image storage" below)
cp server/.env.example server/.env

# 4. Create the schema (migrations) and fill it with demo data (seed)
npm run db:setup

# 5. Run the API and the web app
npm run dev
```

| Service             | URL                                             |
| ------------------- | ----------------------------------------------- |
| Web app             | http://localhost:5173                           |
| API                 | http://localhost:4000/api/v1                    |
| Mailpit (all email) | http://localhost:8025                           |
| PostgreSQL          | `localhost:5433` (5433 avoids a local Postgres) |

### Demo accounts

All demo accounts use the password **`Password123`**.

| Email                       | Role  | Books |
| --------------------------- | ----- | ----- |
| `admin@bookexchange.local`  | Admin | 0     |
| `olena@bookexchange.local`  | User  | 9     |
| `andrii@bookexchange.local` | User  | 8     |
| `iryna@bookexchange.local`  | User  | 8     |

`npm run db:reset` drops the schema, deletes uploaded images from S3, re-runs migrations and
seeds again.

### Image storage (AWS S3)

Uploaded images are stored in S3. Set in `server/.env`:

```env
S3_BUCKET=your-bucket
S3_REGION=eu-central-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

The bucket stays private: the API reads and writes objects under `S3_KEY_PREFIX`
(`bookswap/uploads/` by default) and serves them at `/uploads/...` with long-term caching. The IAM
user only needs `s3:PutObject`, `s3:GetObject` and `s3:DeleteObject` on that prefix and
`s3:ListBucket` limited to it (used by `db:reset`, which deletes only objects under the prefix).

### Sending real email

By default all email goes to Mailpit. To deliver exchange requests to real inboxes, the fastest
option is Gmail SMTP:

1. Enable [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification)
   on a Google account and create an [App Password](https://myaccount.google.com/apppasswords).
2. In `server/.env` set:

   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=you@gmail.com
   SMTP_PASS=your-16-character-app-password
   MAIL_FROM="Bookswap <you@gmail.com>"
   DEMO_EMAIL=you@gmail.com
   ```

3. Restart the API and run `npm run db:reset`. With `DEMO_EMAIL` set, demo users get
   plus-addresses (`you+olena@gmail.com`, `you+andrii@gmail.com`, …), which Gmail delivers to your
   inbox, so you can see every email the app sends. Any other SMTP provider works the same way.

## Project structure

```
├── docker-compose.yml          # PostgreSQL + Mailpit
├── server/                     # Express API
│   ├── tests/                  # API integration tests (Vitest + Supertest)
│   ├── templates/emails/       # Handlebars email templates (shared layout + one file per email)
│   └── src/
│       ├── config/             # env validation (zod), paths
│       ├── database/           # data source, migrations, seed
│       ├── entities/           # User, Book, ExchangeRequest
│       ├── lib/                # mailer, email templates, image uploads, S3 storage
│       ├── middlewares/        # authenticate/authorize, error handler, rate limit
│       ├── modules/            # feature modules: routes → controller → service
│       │   ├── auth/           #   register, login, me, password reset
│       │   ├── books/          #   list/search/paginate, details, update, delete
│       │   ├── exchange-requests/
│       │   ├── me/             #   endpoints of the current user (/me/books, /me/profile, …)
│       │   └── users/          #   admin users CRUD
│       └── utils/              # HttpError, JWT, password hashing, pagination, validation
└── client/                     # React SPA (Vite)
    └── src/
        ├── api/                # axios instance + typed API functions per domain
        ├── app/                # providers, router, query client
        ├── components/         # ui kit (Button, Modal, Pagination, …) and layouts
        ├── features/           # auth, books, admin, profile: components, hooks, schemas
        ├── hooks/              # generic hooks
        ├── lib/                # helpers: errors, formatting, validation
        ├── pages/              # route components composed from features
        ├── routes/             # route guards (protected, guest, admin)
        ├── store/              # auth store (zustand, persisted)
        └── types/              # API types
```

## API

All endpoints are prefixed with the versioned base path `/api/v1`. Everything except register/login/password reset requires
`Authorization: Bearer <token>`.

| Method   | Endpoint                       | Description                                                                       |
| -------- | ------------------------------ | --------------------------------------------------------------------------------- |
| `POST`   | `/auth/register`               | Create an account (role `user`)                                                   |
| `POST`   | `/auth/login`                  | Get an access token                                                               |
| `GET`    | `/auth/me`                     | Current user                                                                      |
| `POST`   | `/auth/forgot-password`        | Email a password reset link                                                       |
| `POST`   | `/auth/reset-password`         | Set a new password using the token                                                |
| `GET`    | `/books`                       | `?search=&sort=name_asc\|name_desc\|author_asc\|author_desc\|newest&page=&limit=` |
| `GET`    | `/books/:id`                   | Book details (+ whether you already requested it)                                 |
| `PATCH`  | `/books/:id`                   | Update own book (multipart: `name`, `author`, `photo` or `photoUrl`)              |
| `DELETE` | `/books/:id`                   | Delete own book (admin: any book)                                                 |
| `POST`   | `/books/:id/exchange-requests` | Request an exchange — emails the owner                                            |
| `GET`    | `/me/books`                    | Own books                                                                         |
| `POST`   | `/me/books`                    | Add a book (multipart)                                                            |
| `GET`    | `/me/profile`                  | Profile with books count                                                          |
| `PATCH`  | `/me/profile`                  | Update name, email, avatar (multipart)                                            |
| `GET`    | `/me/exchange-requests`        | Incoming exchange requests                                                        |
| `GET`    | `/admin/users`                 | Admin: users with books count (`?search=&page=&limit=`)                           |
| `POST`   | `/admin/users`                 | Admin: create a user                                                              |
| `PATCH`  | `/admin/users/:id`             | Admin: update a user                                                              |
| `DELETE` | `/admin/users/:id`             | Admin: delete a user with their books                                             |

Errors have a consistent shape: `{ "message": string, "errors"?: { [field]: string[] } }`.
Field errors are displayed next to the matching form inputs on the client.

## Technical notes

- **Layered backend.** Routes only wire middleware, controllers validate input with zod and shape the
  HTTP response, services contain business rules, mappers convert entities to DTOs, so internal
  fields such as `passwordHash` never leak.
- **Migrations instead of `synchronize`.** The database enforces the business rules: named unique
  constraints (one account per email, one request per user and book) are mapped to `409` responses
  in one place, which also covers concurrent requests; `ON DELETE CASCADE` removes a user's books.
- **Search and sorting.** `ILIKE` with escaped wildcards (searching for `%` matches literally),
  case-insensitive alphabetical order and a stable tie-breaker so pages never overlap.
- **Exchange email** is sent in the same transaction that stores the request: if sending fails, the
  request is rolled back, and a double click can never send two emails. Email HTML lives in Handlebars templates (`server/templates/emails`), which
  escape all user content; strict mode fails loudly on a missing variable.
- **Uploads.** Images up to 5 MB are decoded with `sharp`, so files that only claim to be images are
  rejected, then resized (covers up to 800×1200, avatars 256×256) and stored as WebP without metadata
  in a private S3 bucket.
  Files are removed when a book or avatar is replaced or deleted, or when the request fails.
- **Security.** bcrypt password hashing; login and password reset take the same time whether or not
  the account exists; JWTs are pinned to HS256; rate limits on auth and on endpoints that send email;
  `helmet`, CORS restricted to the client, only `http(s)` URLs accepted for covers. The user is
  reloaded on every request, so role changes and deleted accounts take effect immediately.
- **Operations.** Graceful shutdown on `SIGTERM`/`SIGINT` (in-flight requests finish, DB pool closes),
  `/api/v1/health` checks the database, HTTP errors such as `413` keep their status codes, and
  `TRUST_PROXY` makes rate limits see real client IPs behind a reverse proxy.
- **Client data layer.** TanStack Query handles caching and invalidation with query key factories per
  feature, and keeps the previous page visible while the next one loads. Zustand holds only the auth
  session.
- **Forms.** react-hook-form with zod schemas that mirror the server rules; server-side validation
  errors are mapped back onto the fields.
- **UX details.** Debounced search, skeleton loaders, empty states, confirmation dialogs, accessible
  modals, custom select and dropdown menus (Radix UI primitives styled with Tailwind), a cover
  placeholder when an image is missing or broken, lazy-loaded routes with an error page (e.g. when a
  new version was deployed), and a responsive layout.

## Testing

```bash
npm test   # server and client
```

- **Server** (`server/tests`, Vitest + Supertest): 59 tests (integration tests against a separate
  `book_exchange_test` database, which is created and migrated automatically (Docker Postgres must be
  running). S3 is replaced by an in-memory fake, so tests need no AWS access; the S3 storage itself has
  unit tests with a mocked AWS client. Email sending is mocked. Covered: auth, search/sorting/pagination, uploads, permissions,
  the exchange rules (including concurrent requests and email failures), profile and avatars, admin
  users, password reset.
- **Client** (`*.test.ts(x)` next to the code, Vitest + Testing Library): helpers, form schemas, and the
  search input and pagination components.

## Code quality

- **Pre-commit hook** (husky + lint-staged): staged files are formatted with Prettier and linted
  (ESLint on the server, oxlint on the client), then all tests run. The hook is installed
  automatically by `npm run setup`; Docker Postgres must be running for the tests.
- **CI** (GitHub Actions): separate pipelines, each running on every push to `main` and every pull
  request, with one job per app (`server`, `client`):

  | Workflow    | File                              | Checks                                          |
  | ----------- | --------------------------------- | ----------------------------------------------- |
  | `Lint`      | `.github/workflows/lint.yml`      | Prettier format check, ESLint / oxlint          |
  | `Typecheck` | `.github/workflows/typecheck.yml` | TypeScript                                      |
  | `Test`      | `.github/workflows/test.yml`      | Unit and integration tests (server: + Postgres) |
  | `Build`     | `.github/workflows/build.yml`     | Production build                                |

  The shared setup (Node.js from `.nvmrc`, npm cache, `npm ci`) lives in `.github/actions/setup`.

## Scripts

| Root                   | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run setup`        | Install dependencies of both apps   |
| `npm run dev`          | Run API and web app together        |
| `npm test`             | Run server and client tests         |
| `npm run build`        | Build both apps                     |
| `npm run typecheck`    | Type-check both apps                |
| `npm run lint`         | Lint both apps                      |
| `npm run format:check` | Check formatting of both apps       |
| `npm run db:setup`     | Run migrations and seed demo data   |
| `npm run db:reset`     | Drop the schema and set it up again |

Server (`--prefix server`): `migration:generate -- src/database/migrations/<Name>`,
`migration:run`, `migration:revert`, `db:seed`, `uploads:clear`, `test:watch`.
