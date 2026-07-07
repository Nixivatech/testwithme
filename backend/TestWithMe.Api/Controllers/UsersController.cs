using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.DTOs;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = User.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(new UserDto(user.Id, user.Email, user.Name, user.AvatarUrl, user.Role.ToString(), user.IsProMember, user.Phone, user.Professional));
    }

    [HttpPost("heartbeat")]
    public async Task<IActionResult> Heartbeat()
    {
        var userId = User.GetUserId();
        await db.Users.Where(u => u.Id == userId)
            .ExecuteUpdateAsync(s => s.SetProperty(u => u.LastSeenAt, DateTimeOffset.UtcNow));
        return Ok();
    }

    [HttpPatch("profile")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound();

        user.Name = request.Name.Trim();
        user.Phone = request.Phone.Trim();
        user.Professional = request.Professional.Trim();
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new UserDto(user.Id, user.Email, user.Name, user.AvatarUrl, user.Role.ToString(), user.IsProMember, user.Phone, user.Professional));
    }
}

public record UpdateProfileRequest(string Name, string Phone, string Professional);
