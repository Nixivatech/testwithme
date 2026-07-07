using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/price-views")]
[Authorize]
public class PriceViewsController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> LogView([FromBody] LogPriceViewRequest request)
    {
        var userId = User.GetUserId();

        var module = await db.Modules.FirstOrDefaultAsync(m => m.Id == request.ModuleId && m.IsPublished && m.Price != null);
        if (module is null) return NoContent();

        var alreadyEnrolled = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.ModuleId == request.ModuleId && e.ExpiresAt > DateTimeOffset.UtcNow);
        if (alreadyEnrolled) return NoContent();

        db.PriceViews.Add(new PriceView
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ModuleId = request.ModuleId,
            ViewedAt = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();

        return NoContent();
    }
}

public record LogPriceViewRequest(Guid ModuleId);
