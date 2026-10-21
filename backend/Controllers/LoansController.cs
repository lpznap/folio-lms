using Library.Authentication;
using Library.Contracts;
using Library.Entities;
using Library.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;
[ApiController, Authorize]
[Route("api/v1/loans")]
public class LoansController(ILoanService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LoanResponse>>> History([FromQuery] string? status) => Ok(await service.GetHistoryAsync(User.GetUserId(), User.IsInRole(Roles.Librarian), status));
    [HttpPost("{id:int}/return")]
    public async Task<IActionResult> Return(int id)
    {
        await service.ReturnAsync(id, User.GetUserId(), User.IsInRole(Roles.Librarian));
        return NoContent();
    }
}
