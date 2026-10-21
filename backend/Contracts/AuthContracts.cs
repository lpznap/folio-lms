using System.ComponentModel.DataAnnotations;

namespace Library.Contracts;
public class LoginRequest
{
    [Required, EmailAddress, StringLength(200)]
    public string Email { get; init; } = "";

    [Required]
    public string Password { get; init; } = "";
}

public class RegisterRequest
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string Name { get; init; } = "";

    [Required, EmailAddress, StringLength(200)]
    public string Email { get; init; } = "";

    [Required, StringLength(100, MinimumLength = 10)]
    public string Password { get; init; } = "";
}

public record UserResponse(int Id, string Name, string Email, string Role);
public record MemberResponse(int Id, string Name, string Email);
public record AuthResponse(string Token, UserResponse User);
