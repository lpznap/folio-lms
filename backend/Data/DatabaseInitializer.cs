using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Library.Entities;

namespace Library.Data;
public static class DatabaseInitializer
{
    public static async Task InitializeAsync(LibraryDb db, IPasswordHasher<User> hasher, IConfiguration config)
    {
        if (!await db.Users.AnyAsync() && config["Seed:Enabled"] == "true")
        {
            var password = config["Seed:Password"] ?? throw new InvalidOperationException("Set Seed__Password when seeding.");
            foreach (var u in new[]
            {
                new User
                {
                    Name = "Alex Morgan",
                    Email = "admin@folio.local",
                    Role = "Librarian"
                },
                new User
                {
                    Name = "Jamie Chen",
                    Email = "member@folio.local",
                    Role = "Member"
                }
            }

            )
            {
                u.PasswordHash = hasher.HashPassword(u, password);
                db.Users.Add(u);
            }

            await db.SaveChangesAsync();
        }

        if (!await db.Books.AnyAsync())
        {
            string[][] books = [["9780735211292", "Atomic Habits", "James Clear", "Avery", "2018", "Personal Growth", "A-01"], ["9780143111597", "The Design of Everyday Things", "Don Norman", "Basic Books", "2013", "Design", "B-02"], ["9780062316097", "Sapiens", "Yuval Noah Harari", "Harper", "2015", "History", "C-03"], ["9780132350884", "Clean Code", "Robert C. Martin", "Prentice Hall", "2008", "Technology", "D-01"], ["9780141439518", "Pride and Prejudice", "Jane Austen", "Penguin", "1813", "Fiction", "E-02"], ["9781455586691", "Deep Work", "Cal Newport", "Grand Central", "2016", "Personal Growth", "A-02"], ["9780201616224", "The Pragmatic Programmer", "Andrew Hunt & David Thomas", "Addison-Wesley", "1999", "Technology", "D-02"], ["9780140449136", "The Odyssey", "Homer", "Penguin Classics", "2003", "Fiction", "E-03"], ["9780465026562", "Thinking, Fast and Slow", "Daniel Kahneman", "Farrar, Straus and Giroux", "2011", "Psychology", "F-01"], ["9780061120084", "To Kill a Mockingbird", "Harper Lee", "Harper", "1960", "Fiction", "E-01"], ["9780593135204", "The Creative Act", "Rick Rubin", "Penguin Press", "2023", "Design", "B-01"], ["9780393356182", "The Hidden Life of Trees", "Peter Wohlleben", "Greystone", "2016", "Nature", "G-01"]];
            db.Books.AddRange(books.Select(b => new Book { Isbn = b[0], Title = b[1], Author = b[2], Publisher = b[3], PublicationYear = int.Parse(b[4]), Category = b[5], Shelf = b[6] }));
            await db.SaveChangesAsync();
        }
    }
}
