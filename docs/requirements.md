# Assessment requirement coverage

| Requirement | Implementation |
| --- | --- |
| Secure authentication and role authorization | JWT bearer validation, password hashing, member registration, librarian policies |
| Inventory CRUD and all required metadata | BookInput, book endpoints, catalog add/edit/detail dialogs |
| Shelf and availability tracking | Shelf metadata; availability derived from active loans |
| Search by title, author, ISBN | Catalog search query |
| Category and availability filters | Catalog select controls and API query filters |
| Sorting and pagination | Title/author/year sorting; page and bounded pageSize |
| Assign books to users | Librarian assignment dialog, member lookup, borrow endpoint |
| Prevent unavailable borrowing | Service validation plus unique filtered database index |
| Borrow/return dates and current borrower | Loan model, active-loan view and transaction history |
| Return processing | Ownership policy, return endpoint, stock updates by active-loan state |
| Personal/all history | Member-scoped loans; librarian-wide transaction list |
| Three tiers, DI, validation, logging and errors | React presentation, API controllers, application services, EF Core and structured exception middleware |
| .NET 8 and React | Library.Api.csproj and frontend/package.json |
| SQL Server, schema, ERD, creation script | Compose service, docs/schema.sql, docs/architecture.md |
| README setup, decisions, stack and architecture | README.md and linked architecture document |
| Tests | tests/LibraryTests.cs |
| Docker and CI | Dockerfiles, compose.yaml, .github/workflows/ci.yml |
| Versioning, Swagger and auditing | /api/v1, development Swagger UI, persistent Audits |
| AI usage disclosure | README AI assistance section |

Bonus distributed caching and AI recommendations are not implemented. The app queries current availability directly. Container startup and SQL Server login/catalog/statistics reads were smoke-tested. Browser visual validation remains unverified as documented in verification.md.
