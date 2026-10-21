using System.Security.Claims;
using Library.Exceptions;

namespace Library.Authentication;
public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal) => int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : throw new DomainException("Invalid user identity.", 401);
}
