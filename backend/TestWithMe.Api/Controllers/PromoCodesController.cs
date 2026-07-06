using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/promos")]
[Authorize]
public class PromoCodesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PromoCodeDto>>> GetAll()
    {
        var userId = User.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user?.Role != UserRole.Admin) return Forbid();

        var codes = await db.PromoCodes
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PromoCodeDto(p.Id, p.Code, p.ModuleId, p.MaxUses, p.UsedCount, p.IsActive, p.CreatedAt))
            .ToListAsync();

        return Ok(codes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromoRequest request)
    {
        var userId = User.GetUserId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user?.Role != UserRole.Admin) return Forbid();

        var normalized = request.Code.Trim().ToUpper();
        var exists = await db.PromoCodes.AnyAsync(p => p.Code == normalized);
        if (exists) return BadRequest(new { message = "A promo code with this name already exists." });

        db.PromoCodes.Add(new PromoCode
        {
            Id = Guid.NewGuid(),
            Code = normalized,
            ModuleId = request.ModuleId,
            MaxUses = request.MaxUses > 0 ? request.MaxUses : 1,
            UsedCount = 0,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        });

        await db.SaveChangesAsync();
        return Ok(new { message = "Promo code created." });
    }
}

public record PromoCodeDto(Guid Id, string Code, Guid? ModuleId, int MaxUses, int UsedCount, bool IsActive, DateTimeOffset CreatedAt);
public record CreatePromoRequest(string Code, Guid? ModuleId, int MaxUses);
