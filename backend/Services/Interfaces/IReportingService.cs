using Library.Contracts;

namespace Library.Services.Interfaces;
public interface IReportingService
{
    Task<StatsResponse> GetStatsAsync();
    Task<IReadOnlyList<MemberResponse>> GetMembersAsync();
    Task<IReadOnlyList<AuditResponse>> GetAuditAsync();
}
