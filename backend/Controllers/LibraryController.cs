using Library.Authentication;
using Library.Contracts;
using Library.Entities;
using Library.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;

[ApiController, Authorize]
[Route("api/v1")]
public class LibraryController(IBookService books, IReportingService reporting) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<string>>> Categories() => Ok(await books.GetCategoriesAsync());
    [HttpGet("stats")]
    public async Task<ActionResult<StatsResponse>> Stats() => Ok(await reporting.GetStatsAsync());
    [HttpGet("users"), Authorize(Roles = Roles.Librarian)]
    public async Task<ActionResult<IReadOnlyList<MemberResponse>>> Members() => Ok(await reporting.GetMembersAsync());
    [HttpGet("audit"), Authorize(Roles = Roles.Librarian)]
    public async Task<ActionResult<IReadOnlyList<AuditResponse>>> Audit() => Ok(await reporting.GetAuditAsync());
}
