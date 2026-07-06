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
    [HttpDelete("flush-test-users")]
    public async Task<IActionResult> FlushTestUsers()
    {
        var adminEmails = await db.Users
            .Where(u => u.Role == UserRole.Admin)
            .Select(u => u.Email)
            .ToListAsync();

        // Delete all non-admin users (cascade removes their enrollments, progress, quiz data, certificates)
        var nonAdmins = await db.Users.Where(u => u.Role != UserRole.Admin).ToListAsync();
        db.Users.RemoveRange(nonAdmins);

        // Clear admin's own transactional data so they start fresh too
        var adminIds = await db.Users.Where(u => u.Role == UserRole.Admin).Select(u => u.Id).ToListAsync();
        await db.Enrollments.Where(e => adminIds.Contains(e.UserId)).ExecuteDeleteAsync();
        await db.ProgressEntries.Where(p => adminIds.Contains(p.UserId)).ExecuteDeleteAsync();
        await db.QuizAttempts.Where(q => adminIds.Contains(q.UserId)).ExecuteDeleteAsync();
        await db.Certificates.Where(c => adminIds.Contains(c.UserId)).ExecuteDeleteAsync();

        await db.SaveChangesAsync();

        return Ok(new { message = $"Flushed {nonAdmins.Count} non-admin user(s). Admin accounts preserved." });
    }
}
