using Library.Configuration;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddLibraryServices(builder.Configuration);
var app = builder.Build();
await app.InitializeLibraryAsync();
app.UseLibraryApi();
app.Run();
// Exposes the entry point to WebApplicationFactory integration tests.
public partial class Program
{
}
