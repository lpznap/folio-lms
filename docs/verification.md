# Verification

- ASP.NET Core 8 backend compiled successfully.
- Two HTTP integration tests passed using WebApplicationFactory and isolated SQLite databases. The lifecycle test checks login, anonymous/member access restrictions, librarian book creation, duplicate ISBN rejection, assignment protection, borrowing, unavailable-book rejection, active-loan removal protection, return ownership, return processing, duplicate return rejection, soft removal, and history preservation. The validation test checks invalid registration and invalid credentials.
- TypeScript checking and Vite production build passed.
- The corrected development launcher started on port 5173. It maps a temporary drive on Windows to handle this repository's `#` path and uses inline Vite configuration to avoid duplicate config watchers.
- npm installation audit reported zero vulnerabilities at installation time.
- On 2026-10-19, the refactored API Docker image built and started successfully against the existing healthy SQL Server container. An HTTP smoke check authenticated the librarian and queried catalog/statistics successfully (12 books). This verifies startup and read paths; full lifecycle integration tests still use SQLite.
- Visual/browser verification was not completed: the browser permission gate declined opening the local preview. No alternate browser access was attempted.

Build and test commands are documented in the README. These results do not claim a production security audit, load testing, or SQL Server integration testing.

## Backend structure refactor (2026-10-19)

Release-mode integration tests passed (2/2), including added controller/DTO regression checks for book details, updates, invalid update payloads, filtered/paginated queries, categories, member/audit authorization, statistics and current-user information. Docker publish completed successfully. Existing SQL Server data was retained.

## Docker breakpoint verification (2026-10-19)

Verified directly in VS Code using the standalone C# extension: the Docker debugger bound LoanService line 13, paused there, continued to the breakpoint at line 14, and continued again to complete a request for nonexistent book 0 with the expected HTTP 404. No loan was created. The debugger remains attached and running. The workspace uses dotnet.preferCSharpExtension=true and requireExactSource=false; see backend-structure.md for the compatibility rationale.

