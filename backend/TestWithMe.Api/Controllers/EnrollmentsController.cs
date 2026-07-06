using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize]
public class EnrollmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet("mine")]
    public async Task<ActionResult<List<Guid>>> GetMyEnrollments()
    {
        var userId = User.GetUserId();
        var moduleIds = await db.Enrollments
            .Where(e => e.UserId == userId)
            .Select(e => e.ModuleId)
            .ToListAsync();
        return Ok(moduleIds);
    }

    [HttpPost("dummy-purchase")]
    public async Task<IActionResult> DummyPurchase([FromBody] DummyPurchaseRequest request)
    {
        var userId = User.GetUserId();

        var module = await db.Modules.FirstOrDefaultAsync(m => m.Id == request.ModuleId && m.IsPublished);
        if (module is null) return NotFound();

        var exists = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.ModuleId == request.ModuleId);
        if (exists) return Ok(new { message = "Already enrolled." });

        db.Enrollments.Add(new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ModuleId = request.ModuleId,
            PurchasedAt = DateTimeOffset.UtcNow,
            AmountPaid = module.Price ?? 0,
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Enrolled successfully." });
    }
    [HttpPost("redeem")]
    public async Task<IActionResult> RedeemPromoCode([FromBody] RedeemRequest request)
    {
        var userId = User.GetUserId();
        var entered = request.Code.Trim().ToUpper();

        // Dynamic daily code: ML{YY}{DD}{MM}  e.g. ML260407 for 2026-07-04
        var today = DateTimeOffset.UtcNow;
        var dailyCode = $"ML{today:yy}{today:dd}{today:MM}";
        bool isDailyCode = entered == dailyCode;

        Guid? moduleId;

        if (isDailyCode)
        {
            // Daily code is valid for any module — caller must supply moduleId
            moduleId = request.ModuleId;
            if (moduleId is null) return BadRequest(new { message = "Please specify which module to unlock." });
        }
        else
        {
            // Fall back to stored promo codes
            var stored = await db.PromoCodes
                .FirstOrDefaultAsync(p => p.Code == entered && p.IsActive);

            if (stored is null) return BadRequest(new { message = "Invalid or expired promo code." });
            if (stored.UsedCount >= stored.MaxUses) return BadRequest(new { message = "This promo code has already been fully used." });

            moduleId = stored.ModuleId ?? request.ModuleId;
            if (moduleId is null) return BadRequest(new { message = "This code is not tied to a module. Please contact support." });

            var module = await db.Modules.FirstOrDefaultAsync(m => m.Id == moduleId && m.IsPublished);
            if (module is null) return NotFound(new { message = "Module not found." });

            var alreadyEnrolled = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.ModuleId == moduleId);
            if (alreadyEnrolled) return Ok(new { message = "Already enrolled.", moduleId });

            db.Enrollments.Add(new Enrollment
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ModuleId = moduleId.Value,
                PurchasedAt = DateTimeOffset.UtcNow,
                AmountPaid = 0,
            });

            stored.UsedCount++;
            await db.SaveChangesAsync();

            return Ok(new { message = "Promo code redeemed! You now have full access.", moduleId });
        }

        // Enroll via daily code
        var mod = await db.Modules.FirstOrDefaultAsync(m => m.Id == moduleId && m.IsPublished);
        if (mod is null) return NotFound(new { message = "Module not found." });

        var exists = await db.Enrollments.AnyAsync(e => e.UserId == userId && e.ModuleId == moduleId);
        if (exists) return Ok(new { message = "Already enrolled.", moduleId });

        db.Enrollments.Add(new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ModuleId = moduleId.Value,
            PurchasedAt = DateTimeOffset.UtcNow,
            AmountPaid = 0,
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Promo code accepted! You now have full access.", moduleId });
    }
}

public record DummyPurchaseRequest(Guid ModuleId);
public record RedeemRequest(string Code, Guid? ModuleId);
