using Library.Contracts;
using Library.Data;
using Library.Entities;
using Library.Exceptions;
using Library.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Library.Services;

public class BookService(LibraryDb db, ILogger<BookService> logger) : IBookService
{
    public async Task<PagedResponse<BookResponse>> SearchAsync(BookQuery query)
    {
        logger.LogInformation(
            "Searching books: Search={Search}, Category={Category}, Availability={Availability}, Sort={Sort}",
            query.Search, query.Category, query.Availability, query.Sort);
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var books = db.Books.AsNoTracking().Where(x => !x.IsDeleted);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            books = books.Where(x => x.Title.Contains(search) || x.Author.Contains(search) || x.Isbn.Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
            books = books.Where(x => x.Category == query.Category);
        if (query.Availability == "available")
            books = books.Where(x => !db.Loans.Any(l => l.BookId == x.Id && l.ReturnedAt == null));
        if (query.Availability == "borrowed")
            books = books.Where(x => db.Loans.Any(l => l.BookId == x.Id && l.ReturnedAt == null));
        books = query.Sort switch
        {
            "year" => books.OrderByDescending(x => x.PublicationYear),
            "author" => books.OrderBy(x => x.Author),
            _ => books.OrderBy(x => x.Title)
        };
        var total = await books.CountAsync();
        var items = await Project(books.Skip((page - 1) * pageSize).Take(pageSize)).ToListAsync();
        logger.LogInformation(
            "Book search returned {ResultCount} of {TotalCount} books on page {Page} with page size {PageSize}",
            items.Count, total, page, pageSize);
        return new(total, page, pageSize, items);
    }

    public async Task<BookResponse> GetAsync(int id) => await Project(db.Books.AsNoTracking().Where(x => x.Id == id && !x.IsDeleted)).SingleOrDefaultAsync() ?? throw new DomainException("Book not found.", 404);
    public async Task<BookResponse> CreateAsync(BookRequest request, int actor)
    {
        await EnsureUniqueIsbnAsync(request.Isbn.Trim());
        var book = new Book();
        Apply(book, request);
        db.Books.Add(book);
        db.Audits.Add(new() { ActorId = actor, Action = $"Create book {book.Isbn}" });
        await db.SaveChangesAsync();
        logger.LogInformation("Book {BookId} created by user {ActorId}", book.Id, actor);
        return await GetAsync(book.Id);
    }

    public async Task UpdateAsync(int id, BookRequest request, int actor)
    {
        var book = await FindAsync(id);
        await EnsureUniqueIsbnAsync(request.Isbn.Trim(), id);
        Apply(book, request);
        db.Audits.Add(new() { ActorId = actor, Action = $"Update book {id}" });
        await db.SaveChangesAsync();
        logger.LogInformation("Book {BookId} updated by user {ActorId}", id, actor);
    }

    public async Task DeleteAsync(int id, int actor)
    {
        var book = await FindAsync(id);
        if (await db.Loans.AnyAsync(x => x.BookId == id && x.ReturnedAt == null))
        {
            logger.LogWarning("Removal of book {BookId} by user {ActorId} rejected because it has an active loan", id, actor);
            throw new DomainException("Return this book before removing it.", 409);
        }
        book.IsDeleted = true;
        db.Audits.Add(new() { ActorId = actor, Action = $"Remove book {id}" });
        await db.SaveChangesAsync();
        logger.LogInformation("Book {BookId} removed from inventory by user {ActorId}", id, actor);
    }

    public async Task<IReadOnlyList<string>> GetCategoriesAsync() => await db.Books.Where(x => !x.IsDeleted).Select(x => x.Category).Distinct().OrderBy(x => x).ToListAsync();
    private IQueryable<BookResponse> Project(IQueryable<Book> books) => books.Select(x => new BookResponse(x.Id, x.Isbn, x.Title, x.Author, x.Publisher, x.PublicationYear, x.Category, x.Shelf, !db.Loans.Any(l => l.BookId == x.Id && l.ReturnedAt == null), x.IsDeleted));
    private async Task<Book> FindAsync(int id) => await db.Books.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted) ?? throw new DomainException("Book not found.", 404);
    private async Task EnsureUniqueIsbnAsync(string isbn, int? exceptId = null)
    {
        if (await db.Books.AnyAsync(x => x.Isbn == isbn && x.Id != exceptId))
        {
            logger.LogWarning("Book save rejected because ISBN {Isbn} already exists; edited book {BookId}", isbn, exceptId);
            throw new DomainException("ISBN already exists.", 409);
        }
    }

    private static void Apply(Book book, BookRequest request)
    {
        book.Isbn = request.Isbn.Trim();
        book.Title = request.Title.Trim();
        book.Author = request.Author.Trim();
        book.Publisher = request.Publisher.Trim();
        book.PublicationYear = request.PublicationYear;
        book.Category = request.Category.Trim();
        book.Shelf = request.Shelf.Trim();
    }
}
