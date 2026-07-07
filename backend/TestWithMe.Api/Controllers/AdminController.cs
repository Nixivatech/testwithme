using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminController(AppDbContext db) : ControllerBase
{
    [HttpGet("active-users")]
    public async Task<IActionResult> GetActiveUsers()
    {
        var cutoff = DateTimeOffset.UtcNow.AddMinutes(-5);
        var active = await db.Users
            .Where(u => u.LastSeenAt >= cutoff)
            .OrderByDescending(u => u.LastSeenAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Professional, u.LastSeenAt })
            .ToListAsync();
        return Ok(active);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Phone, u.Professional, u.Role, u.IsProMember, u.CreatedAt, u.LastSeenAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("premium-users")]
    public async Task<IActionResult> GetPremiumUsers()
    {
        var paidUserIds = await db.Enrollments
            .Where(e => e.AmountPaid > 0)
            .Select(e => e.UserId)
            .Distinct()
            .ToListAsync();

        var users = await db.Users
            .Where(u => paidUserIds.Contains(u.Id))
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Phone, u.Professional, u.Role, u.IsProMember, u.CreatedAt, u.LastSeenAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("free-users")]
    public async Task<IActionResult> GetFreeUsers()
    {
        var paidUserIds = await db.Enrollments
            .Where(e => e.AmountPaid > 0)
            .Select(e => e.UserId)
            .Distinct()
            .ToListAsync();

        var users = await db.Users
            .Where(u => u.Role != UserRole.Admin && !paidUserIds.Contains(u.Id))
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Phone, u.Professional, u.Role, u.IsProMember, u.CreatedAt, u.LastSeenAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("expiring-users")]
    public async Task<IActionResult> GetExpiringUsers()
    {
        var now = DateTimeOffset.UtcNow;
        var in15Days = now.AddDays(15);
        var expiringUserIds = await db.Enrollments
            .Where(e => e.ExpiresAt >= now && e.ExpiresAt <= in15Days)
            .Select(e => e.UserId)
            .Distinct()
            .ToListAsync();

        var users = await db.Users
            .Where(u => expiringUserIds.Contains(u.Id))
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Phone, u.Professional, u.Role, u.IsProMember, u.CreatedAt, u.LastSeenAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("expired-users")]
    public async Task<IActionResult> GetExpiredUsers()
    {
        var now = DateTimeOffset.UtcNow;
        var expiredUserIds = await db.Enrollments
            .Where(e => e.ExpiresAt < now)
            .Select(e => e.UserId)
            .Distinct()
            .ToListAsync();

        var users = await db.Users
            .Where(u => expiredUserIds.Contains(u.Id))
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new { u.Id, u.Name, u.Email, u.AvatarUrl, u.Phone, u.Professional, u.Role, u.IsProMember, u.CreatedAt, u.LastSeenAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpDelete("flush-user-data")]
    public async Task<IActionResult> FlushUserData([FromBody] FlushUserDataRequest request)
    {
        if (request.UserIds == null || request.UserIds.Count == 0)
            return BadRequest(new { message = "No users selected." });

        var ids = request.UserIds;

        await db.QuizAttempts.Where(q => ids.Contains(q.UserId)).ExecuteDeleteAsync();
        await db.ProgressEntries.Where(p => ids.Contains(p.UserId)).ExecuteDeleteAsync();
        await db.Enrollments.Where(e => ids.Contains(e.UserId)).ExecuteDeleteAsync();
        await db.Certificates.Where(c => ids.Contains(c.UserId)).ExecuteDeleteAsync();
        await db.Users.Where(u => ids.Contains(u.Id))
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Phone, (string?)null)
                .SetProperty(u => u.Professional, (string?)null));

        return Ok(new { message = $"Flushed data for {ids.Count} user(s). Accounts preserved." });
    }
}

public record FlushUserDataRequest(List<Guid> UserIds);
