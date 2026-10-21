using Library.Contracts;

namespace Library.Services.Interfaces;
public interface ILoanService
{
    Task<BorrowResponse> BorrowAsync(int bookId, int? userId, int actor, bool librarian);
    Task ReturnAsync(int id, int actor, bool librarian);
    Task<IReadOnlyList<LoanResponse>> GetHistoryAsync(int actor, bool librarian, string? status);
}
