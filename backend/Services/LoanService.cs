using Library.Contracts;
using Library.Data;
using Library.Entities;
using Library.Exceptions;
using Library.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Library.Services;
public class LoanService(LibraryDb db, ILogger<LoanService> logger) : ILoanService
{
    public async Task<BorrowResponse> BorrowAsync(int bookId, int? targetUserId, int actor, bool librarian)
    {
        var userId = targetUserId ?? actor;
        if (userId != actor && !librarian)
            throw new DomainException("Only librarians may assign books.", 403);
        if (!await db.Books.AnyAsync(x => x.Id == bookId && !x.IsDeleted))
            throw new DomainException("Book not found.", 404);
        if (!await db.Users.AnyAsync(x => x.Id == userId))
            throw new DomainException("Member not found.", 404);
        if (await db.Loans.AnyAsync(x => x.BookId == bookId && x.ReturnedAt == null))
            throw new DomainException("This book is already borrowed.", 409);
        var loan = new Loan
        {
            BookId = bookId,
            UserId = userId,
            BorrowedAt = DateTime.UtcNow
        };
        db.Loans.Add(loan);
        db.Audits.Add(new() { ActorId = actor, Action = $"Borrow book {bookId} for user {userId}" });
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new DomainException("Book availability changed. Please refresh.", 409);
        }

        logger.LogInformation("Book {BookId} borrowed by {UserId}", bookId, userId);
        return new(loan.Id, loan.BookId, loan.UserId, loan.BorrowedAt);
    }

    public async Task ReturnAsync(int id, int actor, bool librarian)
    {
        logger.LogInformation("Returning loan {LoanId}", id);
        var loan = await db.Loans.FindAsync(id) ?? throw new DomainException("Loan not found.", 404);
        if (!librarian && loan.UserId != actor)
            throw new DomainException("Access denied.", 403);
        if (loan.ReturnedAt != null)
            throw new DomainException("This book has already been returned.", 409);
        loan.ReturnedAt = DateTime.UtcNow;
        db.Audits.Add(new() { ActorId = actor, Action = $"Return loan {id}" });
        await db.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<LoanResponse>> GetHistoryAsync(int actor, bool librarian, string? status)
    {
        var loans = db.Loans.AsNoTracking();
        if (!librarian)
            loans = loans.Where(x => x.UserId == actor);
        if (status == "active")
            loans = loans.Where(x => x.ReturnedAt == null);
        if (status == "returned")
            loans = loans.Where(x => x.ReturnedAt != null);
        return await loans.OrderByDescending(x => x.BorrowedAt).Select(x => new LoanResponse(x.Id, x.BookId, x.Book.Title, x.Book.Author, x.Book.Isbn, x.User.Name, x.User.Email, x.BorrowedAt, x.ReturnedAt, x.ReturnedAt == null ? "Borrowed" : "Returned")).ToListAsync();
    }
}
