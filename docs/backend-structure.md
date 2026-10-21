# Backend structure

The backend uses a layered, single-project architecture on ASP.NET Core 8. It keeps deployment simple while separating presentation, application rules and persistence. Existing `/api/v1` routes and startup commands are retained; no database recreation or migration is required by this refactor.

```text
backend/
  Controllers/             # HTTP routing, authorization and responses
    AuthController.cs
    BooksController.cs
    LoansController.cs
    LibraryController.cs   # Categories, statistics, member lookup and audit
  Contracts/               # Validated request DTOs and explicit response DTOs
  Services/
    Interfaces/            # Contracts injected into controllers
    AuthService.cs
    BookService.cs
    LoanService.cs
    ReportingService.cs
  Data/
    LibraryDb.cs
    DatabaseInitializer.cs
    Configurations/        # EF Core indexes and relationships
  Entities/                # User, Book, Loan, Audit and role names
  Authentication/          # JWT settings, token service and identity helpers
  Exceptions/              # Expected application/domain failures
  Middleware/              # Central exception handling and logging
  Configuration/           # Dependency injection and startup extensions
  Program.cs               # Composition root only
```

## Request flow

1. Authentication validates the JWT. Controller authorization attributes enforce access.
2. `[ApiController]` binds requests and automatically validates data annotations. Invalid input returns HTTP 400 validation problem details with field errors.
3. Controllers call service interfaces. Services apply business rules, map response DTOs, and use the injected EF Core DbContext.
4. EF Core performs persistence. The database guarantees unique email/ISBN and one active loan per book.
5. Exception middleware converts expected domain exceptions to their HTTP status. Unexpected exceptions are logged and return a generic message with a trace ID.

JWT signing and validation use the same configured issuer, audience and key. JWT options are validated at startup. Tokens retain their existing two-hour lifetime. Registration always creates a Member.

## Adding a feature

Add request/response types to Contracts, application operations to a service interface and implementation, then expose them in a controller. Register new services in ServiceCollectionExtensions. Keep database configuration under Data/Configurations. Add integration coverage in tests for changed behavior and authorization boundaries.

EF Core already provides change tracking and unit-of-work behavior, so a wrapper repository is not required. This structure can later be split into separate assemblies if the application grows.

## Verification

```powershell
dotnet test tests/Library.Tests.csproj
dotnet build backend/Library.Api.csproj --configuration Release
```

The integration suite covers routing, DTO validation, authentication, role restrictions, catalog queries, book updates, borrowing/returns and retained history against isolated SQLite databases. SQL Server is still selected through the existing DatabaseProvider and connection-string configuration. Swagger remains available at `/swagger` in Development, now including a bearer-token authorization input.

## VS Code Docker debugger compatibility

The Docker attach profile sets `requireExactSource: false` because this installed VS Code/debugger combination rejects source breakpoint requests containing its checksum payload. This relaxes the debugger's source checksum enforcement; rebuild the API after source changes to keep source and binaries aligned. The container's PDB document checksums were compared with the workspace sources during diagnosis.

Workspace settings set `dotnet.preferCSharpExtension` to `true` to use the standalone C# extension. The Dev Kit brokered Hot Reload connection was failing during Continue. Apply code changes by rebuilding and reattaching.
