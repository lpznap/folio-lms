namespace Library.Contracts;
public class BorrowRequest
{
    public int? UserId { get; init; }
}

public record BorrowResponse(int Id, int BookId, int UserId, DateTime BorrowedAt);
public record LoanResponse(int Id, int BookId, string Title, string Author, string Isbn, string User, string Email, DateTime BorrowedAt, DateTime? ReturnedAt, string Status);
