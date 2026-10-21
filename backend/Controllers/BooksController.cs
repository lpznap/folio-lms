using Library.Authentication;
using Library.Contracts;
using Library.Entities;
using Library.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController, Authorize]
[Route("api/v1/books")]
public class BooksController(IBookService books, ILoanService loans) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResponse<BookResponse>>> Search([FromQuery] BookQuery query) => Ok(await books.SearchAsync(query));
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookResponse>> Get(int id) => Ok(await books.GetAsync(id));
    [HttpPost, Authorize(Roles = Roles.Librarian)]
    public async Task<ActionResult<BookResponse>> Create(BookRequest request)
    {
        var book = await books.CreateAsync(request, User.GetUserId());
        return CreatedAtAction(nameof(Get), new { id = book.Id }, book);
    }

    [HttpPut("{id:int}"), Authorize(Roles = Roles.Librarian)]
    public async Task<IActionResult> Update(int id, BookRequest request)
    {
        await books.UpdateAsync(id, request, User.GetUserId());
        return NoContent();
    }

    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Librarian)]
    public async Task<IActionResult> Delete(int id)
    {
        await books.DeleteAsync(id, User.GetUserId());
        return NoContent();
    }

    [HttpPost("{id:int}/borrow")]
    public async Task<ActionResult<BorrowResponse>> Borrow(int id, BorrowRequest request) => Ok(await loans.BorrowAsync(id, request.UserId, User.GetUserId(), User.IsInRole(Roles.Librarian)));
}
