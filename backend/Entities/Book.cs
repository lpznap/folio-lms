using System.ComponentModel.DataAnnotations;

namespace Library.Entities;
public class Book
{
    public int Id { get; set; }

    [MaxLength(32)]
    public string Isbn { get; set; } = "";

    [MaxLength(200)]
    public string Title { get; set; } = "";
    public string Author { get; set; } = "";
    public string Publisher { get; set; } = "";
    public int PublicationYear { get; set; }
    public string Category { get; set; } = "";
    public string Shelf { get; set; } = "";
    public bool IsDeleted { get; set; }
}
