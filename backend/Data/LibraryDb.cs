using Library.Entities;
using Microsoft.EntityFrameworkCore;

namespace Library.Data;
public class LibraryDb(DbContextOptions<LibraryDb> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<Audit> Audits => Set<Audit>();

    protected override void OnModelCreating(ModelBuilder builder) => builder.ApplyConfigurationsFromAssembly(typeof(LibraryDb).Assembly);
}
