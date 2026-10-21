using System.ComponentModel.DataAnnotations;

namespace Library.Contracts;
public class BookRequest
{
    [Required, StringLength(32)]
    public string Isbn { get; init; } = "";

    [Required, StringLength(200)]
    public string Title { get; init; } = "";

    [Required, StringLength(200)]
    public string Author { get; init; } = "";

    [Required, StringLength(200)]
    public string Publisher { get; init; } = "";

    [Range(1000, 2100)]
    public int PublicationYear { get; init; }

    [Required, StringLength(100)]
    public string Category { get; init; } = "";

    [Required, StringLength(100)]
    public string Shelf { get; init; } = "";
}

public class BookQuery
{
    public string? Search { get; init; }
    public string? Category { get; init; }
    public string? Availability { get; init; }
    public string? Sort { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 9;
}

public record BookResponse(int Id, string Isbn, string Title, string Author, string Publisher, int PublicationYear, string Category, string Shelf, bool Available, bool IsDeleted = false);
public record PagedResponse<T>(int Total, int Page, int PageSize, IReadOnlyList<T> Items);
