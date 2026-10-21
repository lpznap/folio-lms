# Folio — Library Management System

A complete React + ASP.NET Core 8 library assessment project. Includes librarian/member authentication, catalog management, search and filtering, assignments, borrowing, returns, personal/global history, audit logging, automated integration tests, Docker and CI.

## Run locally

Requirements: Node.js 22+, npm, .NET SDK 8. A workspace-local SDK is supported at `.tools/dotnet`.

In terminal 1, from this repository:

```powershell
./scripts/start-api.ps1
```

In terminal 2:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Swagger UI: http://localhost:5080/swagger. API prefix: `/api/v1`.

The startup script creates an SQLite database and seeds 12 books and two demo accounts on the first run:

| Role | Email | Password |
| --- | --- | --- |
| Librarian / administrator | admin@folio.local | FolioDemo2026! |
| Member | member@folio.local | FolioDemo2026! |

These are development credentials only. Pass `-DemoPassword` and `-JwtKey` to override them; the password applies only when the database has no users. New visitors can register as members. No public endpoint grants librarian access. To reset the demo, stop the API and remove its `library.db` file (and WAL/SHM sidecars if present).

## Docker with SQL Server

Copy `.env.example` to `.env` and replace all three sample secrets. Run:

```sh
docker compose up --build
```

Open http://localhost:8080. SQL Server data persists in a named volume. The API waits for SQL Server's healthcheck before creating the database. Database credentials remain on the internal Compose network. Use a TLS reverse proxy for public deployment. Swagger is enabled only in Development.

## Build and test

```sh
dotnet build backend/Library.Api.csproj
dotnet test tests/Library.Tests.csproj
cd frontend
npm ci
npm run build
```

On this workspace, use `.tools/dotnet/dotnet.exe` if .NET 8 is not on PATH. For constrained environments set `DOTNET_CLI_HOME` to `.tools/cli` and `NUGET_PACKAGES` to `.tools/nuget` (the startup script does this). CI uses GitHub Actions to test the backend and build the frontend. Integration tests exercise real HTTP middleware and a fresh SQLite database: authentication, role enforcement, duplicate ISBN, invalid input, cross-user assignment/return denial, unavailable-book rejection, return processing, deletion protection and retained history.

## Updating code in Docker from VS Code

Save your changes, then run these commands in the VS Code terminal from the repository root (the folder containing `compose.yaml`). Docker runs a compiled snapshot of your code; saving files does not automatically update the running containers.

For backend changes:

```powershell
docker compose up -d --build api
```

For frontend changes:

```powershell
docker compose up -d --build web
```

To rebuild and start the whole application:

```powershell
docker compose up -d --build
```

Open http://localhost:8080 after the build completes. For frontend changes, refresh with **Ctrl+F5** to bypass the browser cache.

| Command | What it updates |
| --- | --- |
| `dotnet build` | Local build output only; does not update Docker |
| `docker compose build api` | API image only; does not replace the running container |
| `docker compose up -d --build api` | Builds the API image and recreates the container when needed |
| `docker compose restart api` | Restarts the existing container; does not rebuild code |

View backend logs and container status:

```powershell
docker compose logs -f api
docker compose ps
```

Press **Ctrl+C** to stop following logs; the containers keep running. Rebuilding application containers preserves the existing SQL Server named volume.

### Reattach the debugger after rebuilding

1. Stop the current debug session with **Shift+F5**.
2. Save your code and run `docker compose up -d --build api`.
3. In VS Code's **Run and Debug** panel, select **Attach to Folio API (Docker)**.
4. Press **F5**, then trigger the relevant operation in the app to hit your breakpoint.

The attach configuration is in `.vscode/launch.json`. Its pre-launch task checks the container, debug symbols and debugger. Build the API in **Debug** configuration for the best breakpoint experience.

### If the terminal reports "No .NET SDKs were found"

This workspace has a local SDK. Build the solution explicitly with:

```powershell
.\.tools\dotnet\dotnet.exe build Folio.sln
```

Alternatively, enable the local SDK for the current PowerShell terminal:

```powershell
$env:DOTNET_ROOT = "$PWD\.tools\dotnet"
$env:PATH = "$env:DOTNET_ROOT;$env:PATH"
dotnet --version
dotnet build Folio.sln
```

These commands build local files only. To update the Docker application, use the Compose rebuild commands above. Docker builds use the SDK inside the build image and do not require a host SDK.

### Automatic frontend updates during development

Run `npm run dev` from `frontend` and open http://127.0.0.1:5173 for Vite's live updates. The development proxy expects a backend at http://localhost:5080, started with `./scripts/start-api.ps1`. This local workflow uses SQLite by default; the Docker application at port 8080 uses SQL Server.

## Architecture and stack

- **Presentation:** React 19, TypeScript, Vite, Lucide icons, responsive CSS. Component state and effects manage session, filters, forms, loading and errors. Catalog searches debounce requests and discard stale results. Tokens live in sessionStorage and clear on sign-out/401.
- **Business:** ASP.NET Core 8 controllers with automatically validated request DTOs, authorization attributes, injected application service interfaces, domain errors and structured logging.
- **Data:** EF Core 8 and SQL Server in Docker; SQLite for local development and tests. Both support the filtered unique active-loan index. Availability is computed, not independently stored.

See [architecture diagram, ERD and decisions](docs/architecture.md) and [SQL Server creation script](docs/schema.sql). The database initializes automatically for the assessment. Read the architecture document before evolving the schema.

## Workflows

1. Sign in as a librarian to add or edit books; all eight required metadata fields are present. Remove a book from its edit dialog after returning active loans.
2. Search by title, author or ISBN; filter by category/availability, sort by title/author/year, and navigate paginated results.
3. Librarians use **Assign book** to select a borrower. Members use **Borrow book** for themselves. Both see availability immediately after a successful operation.
4. Active borrowing lists current loans. **Return book** records the return date and restores availability. History retains returned transactions and soft-deleted books.
5. Librarians can inspect `/api/v1/audit` for the latest 100 audit entries. Members cannot inspect other members' loans or inventory management endpoints.

## API overview

| Method | Route under /api/v1 | Access |
| --- | --- | --- |
| POST | /auth/login, /auth/register | Public, rate limited |
| GET | /auth/me | Authenticated |
| GET | /books, /books/{id}, /categories, /stats | Authenticated |
| POST / PUT / DELETE | /books / /books/{id} | Librarian |
| POST | /books/{id}/borrow | Authenticated; assignment to others requires Librarian |
| GET | /loans | Own history; Librarian sees all |
| POST | /loans/{id}/return | Owner or Librarian |
| GET | /users, /audit | Librarian |

Catalog query parameters: `search`, `category`, `availability=available|borrowed`, `sort=title|author|year`, `page`, `pageSize` (1–100). Loans accept `status=active|returned`. Responses never expose password hashes. Errors include a public title/status; unexpected errors include a trace identifier. `/health` is public liveness.

## Assumptions and scope

Each ISBN identifies one lendable physical copy. There are no reservations, fines, due dates or multi-copy editions because the assessment does not require them. Histories join current metadata rather than immutable snapshots. Registration assigns Member; Librarian represents the Administrator role. Search case behavior follows the database collation. UTC timestamps display in the viewer's locale. Seeded inventory is demonstration data.

The architecture favors a small, readable three-tier deployment over extra services. Persistent SQL data, API versioning, OpenAPI, audit logging, Docker, CI and integration tests are included. AI recommendations and distributed caching are intentionally omitted; authoritative availability is queried directly. SQL Server container execution requires Docker. Local integration tests use SQLite; Docker startup and SQL Server-backed login/catalog/statistics reads were smoke-tested. See docs/verification.md for the limits of this verification.

## AI assistance disclosure

OpenAI Codex assisted with extracting the supplied assessment, architecture, C#/React source generation, CSS, schema, documentation and automated test authoring. The user prompt was: **“Create the project all reference from the file”**, referring to the attached AHHA LMS assessment. Implementation guidance included separating presentation/business/data access, enforcing member ownership on returns, and using a filtered unique index to prevent simultaneous active loans. Generated code was subjected to builds and integration tests; actual local verification results are recorded in `docs/verification.md`. Candidates should review and understand the implementation before submission.
`npm run dev` and `npm run build` use a launcher that temporarily maps a free Windows drive when the repository path contains `#`. The mapping is removed on normal shutdown. Inline Vite configuration lives in `frontend/scripts/vite.mjs`. See `docs/requirements.md` for assessment coverage and `docs/verification.md` for verification limits.

## React source organization

The frontend uses feature folders for authentication, books, library workspace and loans, with shared layout/UI components, typed API utilities and custom hooks. See [frontend structure and extension guide](docs/frontend-structure.md).

## Backend source organization

The backend uses thin controllers, explicit DTOs, service interfaces, EF Core entity configuration, centralized JWT generation and exception middleware. See [backend structure and extension guide](docs/backend-structure.md). Startup commands and API routes are unchanged.

### Docker breakpoint compatibility

This workspace uses the standalone C# extension (`dotnet.preferCSharpExtension: true`) to avoid a C# Dev Kit Hot Reload connection failure during Continue. The attach profile also sets `requireExactSource: false` to avoid malformed checksum requests in the installed debugger combination. Rebuild and reattach after code changes so source and container binaries match. Breakpoint hits and Continue were verified in `LoanService` at lines 13 and 14.

