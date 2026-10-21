using Library.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Library.Data.Configurations;
public class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.HasIndex(x => x.BookId).IsUnique().HasFilter("[ReturnedAt] IS NULL");
        builder.HasOne(x => x.Book).WithMany().OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.User).WithMany().OnDelete(DeleteBehavior.Restrict);
    }
}
