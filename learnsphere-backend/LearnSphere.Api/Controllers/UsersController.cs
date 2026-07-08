using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LearnSphere.Api.Common;
using LearnSphere.Api.Data;
using LearnSphere.Api.DTOs;

namespace LearnSphere.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(LsDbContext db) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userId = User.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound();

        return Ok(new UserDto(user.Id, user.Email, user.Name, user.AvatarUrl, user.Role.ToString(), user.CreatedAt));
    }
}
