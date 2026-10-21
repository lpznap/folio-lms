using Library.Authentication;
using Library.Contracts;
using Library.Entities;
using Library.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Library.Controllers;
[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService service) : ControllerBase
{
    [HttpPost("login"), Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request) => Ok(await service.LoginAsync(request));
    [HttpPost("register"), Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request) => Ok(await service.RegisterAsync(request));
    [Authorize, HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me() => Ok(await service.GetUserAsync(User.GetUserId()));
}
