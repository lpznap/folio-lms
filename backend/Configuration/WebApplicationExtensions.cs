using Library.Authentication;
using Library.Data;
using Library.Entities;
using Library.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Library.Configuration;
public static class WebApplicationExtensions
{
    public static async Task InitializeLibraryAsync(this WebApplication app)
    {
        _ = app.Services.GetRequiredService<IOptions<JwtSettings>>().Value;
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LibraryDb>();
        await db.Database.EnsureCreatedAsync();
        await DatabaseInitializer.InitializeAsync(db, scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>(), app.Configuration);
    }

    public static WebApplication UseLibraryApi(this WebApplication app)
    {
        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseRouting();
        app.UseRateLimiter();
        app.UseAuthentication();
        app.UseAuthorization();
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.MapControllers();
        app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));
        return app;
    }
}
