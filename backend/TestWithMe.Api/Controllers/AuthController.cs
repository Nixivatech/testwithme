using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Data;
using TestWithMe.Api.DTOs;
using TestWithMe.Api.Models;
using TestWithMe.Api.Services;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IGoogleAuthService googleAuth, IJwtService jwt, IEmailService email) : ControllerBase
{
    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> Google([FromBody] GoogleLoginRequest request)
    {
        GoogleProfile profile;
        try
        {
            profile = await googleAuth.VerifyIdTokenAsync(request.IdToken);
        }
        catch (Exception)
        {
            return Unauthorized(new { message = "Invalid Google token." });
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleId == profile.GoogleId);
        var now = DateTimeOffset.UtcNow;

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                GoogleId = profile.GoogleId,
                Email = profile.Email,
                Name = profile.Name,
                AvatarUrl = profile.AvatarUrl,
                Role = UserRole.Student,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.Users.Add(user);
            _ = email.SendNewUserAlertAsync(user.Name, user.Email);
        }
        else
        {
            user.Name = profile.Name;
            user.AvatarUrl = profile.AvatarUrl;
            user.UpdatedAt = now;
        }

        await db.SaveChangesAsync();

        var token = jwt.GenerateToken(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    private static UserDto ToDto(User user) =>
        new(user.Id, user.Email, user.Name, user.AvatarUrl, user.Role.ToString(), user.IsProMember);
}
