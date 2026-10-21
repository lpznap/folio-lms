using Library.Authentication;
using Library.Contracts;
using Library.Data;
using Library.Entities;
using Library.Exceptions;
using Library.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Library.Services;
public class AuthService(LibraryDb db, IPasswordHasher<User> hasher, ITokenService tokens) : IAuthService
{
    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(x => x.Email == email);
        if (user is null || hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            throw new DomainException("Invalid email or password.", 401);
        return CreateResponse(user);
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email))
            throw new DomainException("Email already registered.", 409);
        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            Role = Roles.Member
        };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new DomainException("Email already registered.", 409);
        }

        return CreateResponse(user);
    }

    public async Task<UserResponse> GetUserAsync(int id) => await db.Users.AsNoTracking().Where(x => x.Id == id).Select(x => new UserResponse(x.Id, x.Name, x.Email, x.Role)).SingleOrDefaultAsync() ?? throw new DomainException("User not found.", 404);
    private AuthResponse CreateResponse(User user) => new(tokens.CreateToken(user), new(user.Id, user.Name, user.Email, user.Role));
}
