# TestWithMe

Learn Testing. Get Hired. A QA learning platform for Indian freshers — structured notes, progress
tracking, and verifiable completion certificates.

- **Frontend** (`/frontend`): React + Vite + TypeScript + Tailwind CSS → mathilens.com
- **Backend** (`/backend`): .NET 8 Web API + EF Core (Npgsql) → api.testwithme.in
- **Database**: PostgreSQL on Supabase
- **Auth**: Google Sign-In on the frontend → backend verifies the Google ID token and issues its own JWT
- **Docs**: `/docs/schema.sql` — reference copy of the Postgres schema (EF Core migrations are the source of truth)

## Backend — `backend/TestWithMe.Api`

```
dotnet restore
dotnet ef database update      # applies migrations to the DB in appsettings.Development.json
dotnet run
```

Configure `appsettings.Development.json` (gitignored in real use — committed here with local defaults):
- `ConnectionStrings:Default` — your Supabase Postgres connection string
- `Jwt:Secret` — a long random secret used to sign API JWTs
- `Google:ClientId` — the OAuth client ID from Google Cloud Console
- `Cors:AllowedOrigins` — frontend origin(s) allowed to call the API

To add a migration after changing entities/`AppDbContext`:
```
dotnet ef migrations add <Name>
```
(if `dotnet ef` fails with a framework-resolution error, prefix the command with
`DOTNET_ROLL_FORWARD=Major`)

## Frontend — `frontend`

```
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set:
- `VITE_API_URL` — the backend base URL (e.g. `http://localhost:5000`)
- `VITE_GOOGLE_CLIENT_ID` — the same OAuth client ID used by the backend

## Architecture notes

- Supabase is used purely as a managed Postgres database — auth is **not** handled by Supabase Auth.
  The frontend gets a Google ID token via Google Identity Services, sends it to
  `POST /api/auth/google`, and the backend verifies it with Google, upserts the user, and returns its
  own JWT for subsequent requests.
- Content model: `modules` → `topics` (notes content lives on `topics.content` as markdown).
- A certificate is issued automatically (`CertificateService`) the first time a user completes every
  published topic in a module. Certificates are publicly verifiable at `/verify/{certificateCode}`
  with no auth required.
- `modules.is_pro` / `users.is_pro_member` gate access to Pro-only modules; there's no payment
  integration yet — `is_pro_member` is a plain flag to wire up once billing is added.
