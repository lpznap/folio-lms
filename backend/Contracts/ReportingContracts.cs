namespace Library.Contracts;
public record StatsResponse(int Total, int Borrowed, int Members, int Returned);
public record AuditResponse(int Id, int ActorId, string Action, DateTime At);
