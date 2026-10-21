using Library.Contracts;

namespace Library.Services.Interfaces;
public interface IBookService
{
    Task<PagedResponse<BookResponse>> SearchAsync(BookQuery query);
    Task<BookResponse> GetAsync(int id);
    Task<BookResponse> CreateAsync(BookRequest request, int actor);
    Task UpdateAsync(int id, BookRequest request, int actor);
    Task DeleteAsync(int id, int actor);
    Task<IReadOnlyList<string>> GetCategoriesAsync();
}
