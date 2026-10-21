using System.ComponentModel.DataAnnotations;

namespace Library.Entities;
public class Loan
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; } = null !;
    public int UserId { get; set; }
    public User User { get; set; } = null !;
    public DateTime BorrowedAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
}
