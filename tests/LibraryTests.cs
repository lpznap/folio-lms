using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xunit;

public class LibraryTests
{
    [Fact]
    public async Task FullBorrowingLifecycleEnforcesRolesAndPreservesHistory()
    {
        var file = Path.Combine(Path.GetTempPath(), $"folio-{Guid.NewGuid()}.db");
        try
        {
            await using var app = new WebApplicationFactory<Program>().WithWebHostBuilder(b => b.UseEnvironment("Testing").ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(new Dictionary<string, string?> { { "Jwt:Key", "test-only-secret-with-at-least-32-characters" }, { "Seed:Enabled", "true" }, { "Seed:Password", "IntegrationPassword123!" }, { "DatabaseProvider", "Sqlite" }, { "ConnectionStrings:Library", $"Data Source={file};Pooling=False" } })));
            using var admin = app.CreateClient();
            using var member = app.CreateClient();
            using var stranger = app.CreateClient();
            Assert.Equal(HttpStatusCode.Unauthorized, (await stranger.GetAsync("/api/v1/books")).StatusCode);
            async Task Authenticate(HttpClient client, string email)
            {
                var r = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "IntegrationPassword123!" });
                r.EnsureSuccessStatusCode();
                var data = await r.Content.ReadFromJsonAsync<JsonElement>();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", data.GetProperty("token").GetString());
            }

            await Authenticate(admin, "admin@folio.local");
            await Authenticate(member, "member@folio.local");
            var input = new
            {
                isbn = "TEST-001",
                title = "Integration Book",
                author = "Test Author",
                publisher = "Test Press",
                publicationYear = 2026,
                category = "Testing",
                shelf = "T-01"
            };
            Assert.Equal(HttpStatusCode.Forbidden, (await member.PostAsJsonAsync("/api/v1/books", input)).StatusCode);
            var create = await admin.PostAsJsonAsync("/api/v1/books", input);
            Assert.Equal(HttpStatusCode.Created, create.StatusCode);
            var book = await create.Content.ReadFromJsonAsync<JsonElement>();
            var id = book.GetProperty("id").GetInt32();
            Assert.Equal(HttpStatusCode.Conflict, (await admin.PostAsJsonAsync("/api/v1/books", input)).StatusCode);
            // Regression coverage for controller routing, DTO binding and query projection.
            var detail = await admin.GetFromJsonAsync<JsonElement>($"/api/v1/books/{id}");
            Assert.True(detail.GetProperty("available").GetBoolean());
            Assert.Equal("TEST-001", detail.GetProperty("isbn").GetString());
            Assert.Equal(HttpStatusCode.NoContent, (await admin.PutAsJsonAsync($"/api/v1/books/{id}", input)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await member.PutAsJsonAsync($"/api/v1/books/{id}", input)).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsJsonAsync($"/api/v1/books/{id}", new { title = "Incomplete" })).StatusCode);
            var filtered = await admin.GetFromJsonAsync<JsonElement>("/api/v1/books?search=TEST-001&category=Testing&availability=available&sort=year&page=1&pageSize=1");
            Assert.Equal(1, filtered.GetProperty("total").GetInt32());
            Assert.Single(filtered.GetProperty("items").EnumerateArray());
            Assert.Contains("Testing", (await admin.GetFromJsonAsync<string[]>("/api/v1/categories"))!);
            Assert.Equal(HttpStatusCode.Forbidden, (await member.GetAsync("/api/v1/users")).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await member.GetAsync("/api/v1/audit")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/v1/users")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/v1/audit")).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await member.GetAsync("/api/v1/stats")).StatusCode);
            var identity = await member.GetFromJsonAsync<JsonElement>("/api/v1/auth/me");
            Assert.Equal("Member", identity.GetProperty("role").GetString());

            Assert.Equal(HttpStatusCode.Forbidden, (await member.PostAsJsonAsync($"/api/v1/books/{id}/borrow", new { userId = 1 })).StatusCode);
            var borrow = await member.PostAsJsonAsync($"/api/v1/books/{id}/borrow", new { });
            borrow.EnsureSuccessStatusCode();
            var loan = await borrow.Content.ReadFromJsonAsync<JsonElement>();
            var loanId = loan.GetProperty("id").GetInt32();
            Assert.Equal(HttpStatusCode.Conflict, (await admin.PostAsJsonAsync($"/api/v1/books/{id}/borrow", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await admin.DeleteAsync($"/api/v1/books/{id}")).StatusCode);
            var registered = await stranger.PostAsJsonAsync("/api/v1/auth/register", new { name = "Other Member", email = "other@test.local", password = "IntegrationPassword123!" });
            registered.EnsureSuccessStatusCode();
            var other = await registered.Content.ReadFromJsonAsync<JsonElement>();
            stranger.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", other.GetProperty("token").GetString());
            Assert.Equal(HttpStatusCode.Forbidden, (await stranger.PostAsJsonAsync($"/api/v1/loans/{loanId}/return", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.NoContent, (await member.PostAsJsonAsync($"/api/v1/loans/{loanId}/return", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await member.PostAsJsonAsync($"/api/v1/loans/{loanId}/return", new { })).StatusCode);
            Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/v1/books/{id}")).StatusCode);
            var history = await member.GetFromJsonAsync<JsonElement>("/api/v1/loans");
            Assert.Contains(history.EnumerateArray(), l => l.GetProperty("id").GetInt32() == loanId && l.GetProperty("returnedAt").ValueKind == JsonValueKind.String);
            var catalog = await admin.GetFromJsonAsync<JsonElement>("/api/v1/books?search=TEST-001");
            Assert.Equal(0, catalog.GetProperty("total").GetInt32());
        }
        finally
        {
            if (File.Exists(file))
                File.Delete(file);
        }
    }

    [Fact]
    public async Task RejectsInvalidInputAndInvalidCredentials()
    {
        var file = Path.Combine(Path.GetTempPath(), $"folio-{Guid.NewGuid()}.db");
        try
        {
            await using var app = new WebApplicationFactory<Program>().WithWebHostBuilder(b => b.ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(new Dictionary<string, string?> { { "Jwt:Key", "test-only-secret-with-at-least-32-characters" }, { "ConnectionStrings:Library", $"Data Source={file};Pooling=False" }, { "DatabaseProvider", "Sqlite" } })));
            using var client = app.CreateClient();
            Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/v1/auth/register", new { name = "x", email = "invalid", password = "short" })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "unknown@test.local", password = "WrongPassword123!" })).StatusCode);
        }
        finally
        {
            if (File.Exists(file))
                File.Delete(file);
        }
    }
}
