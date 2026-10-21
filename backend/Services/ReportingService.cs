using Library.Contracts;
using Library.Data;
using Library.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Library.Services;

public class ReportingService(LibraryDb db, ILogger<ReportingService> logger) : IReportingService
{
    public async Task<StatsResponse> GetStatsAsync() => new(await db.Books.CountAsync(x => !x.IsDeleted), await db.Loans.CountAsync(x => x.ReturnedAt == null), await db.Users.CountAsync(), await db.Loans.CountAsync(x => x.ReturnedAt != null));
    public async Task<IReadOnlyList<MemberResponse>> GetMembersAsync() => await db.Users.AsNoTracking().OrderBy(x => x.Name).Select(x => new MemberResponse(x.Id, x.Name, x.Email)).ToListAsync();
    public async Task<IReadOnlyList<AuditResponse>> GetAuditAsync() => await db.Audits.AsNoTracking().OrderByDescending(x => x.At).Take(100).Select(x => new AuditResponse(x.Id, x.ActorId, x.Action, x.At)).ToListAsync();
}
