using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.DTOs;
using TestWithMe.Api.Models;
using Module = TestWithMe.Api.Models.Module;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/modules")]
public class ModulesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ModuleSummaryDto>>> GetModules()
    {
        var userId = User.GetUserId();

        var modules = await db.Modules
            .Where(m => m.IsPublished)
            .OrderBy(m => m.OrderIndex)
            .Select(m => new
            {
                m.Id,
                m.Slug,
                m.Title,
                m.Description,
                m.IsPro,
                m.Price,
                m.Features,
                TopicCount = m.Topics.Count(t => t.IsPublished),
                CompletedCount = m.Topics.Count(t => t.IsPublished &&
                    db.ProgressEntries.Any(p => p.TopicId == t.Id && p.UserId == userId))
            })
            .ToListAsync();

        var result = modules
            .Select(m => new ModuleSummaryDto(m.Id, m.Slug, m.Title, m.Description, m.IsPro, m.TopicCount, m.CompletedCount, m.Price, m.Features))
            .ToList();

        return Ok(result);
    }

    [HttpGet("all-details")]
    [Authorize]
    public async Task<ActionResult<List<ModuleDetailDto>>> GetAllModuleDetails()
    {
        var userId = User.GetUserId();

        var modules = await db.Modules
            .Where(m => m.IsPublished)
            .OrderBy(m => m.OrderIndex)
            .Include(m => m.Topics.Where(t => t.IsPublished).OrderBy(t => t.OrderIndex))
            .ToListAsync();

        var completedTopicIds = await db.ProgressEntries
            .Where(p => p.UserId == userId)
            .Select(p => p.TopicId)
            .ToListAsync();

        var result = modules.Select(m => new ModuleDetailDto(
            m.Id, m.Slug, m.Title, m.Description, m.IsPro,
            m.Topics.Select(t => new TopicSummaryDto(t.Id, t.Slug, t.Title, t.OrderIndex, completedTopicIds.Contains(t.Id))).ToList(),
            m.Price, m.Features
        )).ToList();

        return Ok(result);
    }

    [HttpGet("{slug}")]
    [Authorize]
    public async Task<ActionResult<ModuleDetailDto>> GetModule(string slug)
    {
        var userId = User.GetUserId();

        var module = await db.Modules
            .Include(m => m.Topics.Where(t => t.IsPublished).OrderBy(t => t.OrderIndex))
            .FirstOrDefaultAsync(m => m.Slug == slug && m.IsPublished);

        if (module is null)
        {
            return NotFound();
        }

        var user = await db.Users.FirstAsync(u => u.Id == userId);
        if (module.IsPro && !user.IsProMember)
        {
            return Forbid();
        }

        var completedTopicIds = await db.ProgressEntries
            .Where(p => p.UserId == userId && module.Topics.Select(t => t.Id).Contains(p.TopicId))
            .Select(p => p.TopicId)
            .ToListAsync();

        var topics = module.Topics
            .Select(t => new TopicSummaryDto(t.Id, t.Slug, t.Title, t.OrderIndex, completedTopicIds.Contains(t.Id)))
            .ToList();

        return Ok(new ModuleDetailDto(module.Id, module.Slug, module.Title, module.Description, module.IsPro, topics, module.Price, module.Features));
    }

    [HttpGet("{moduleSlug}/topics/{topicSlug}")]
    [Authorize]
    public async Task<ActionResult<TopicDetailDto>> GetTopic(string moduleSlug, string topicSlug)
    {
        var userId = User.GetUserId();

        var topic = await db.Topics
            .Include(t => t.Module)
            .FirstOrDefaultAsync(t => t.Slug == topicSlug && t.Module!.Slug == moduleSlug
                && t.IsPublished && t.Module!.IsPublished);

        if (topic is null)
        {
            return NotFound();
        }

        var user = await db.Users.FirstAsync(u => u.Id == userId);
        if (topic.Module!.IsPro && !user.IsProMember)
        {
            return Forbid();
        }

        var enrollment = await db.Enrollments.FirstOrDefaultAsync(e => e.UserId == userId && e.ModuleId == topic.ModuleId);
        if (enrollment is not null && enrollment.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return StatusCode(403, new { message = "Your access to this module has expired.", expired = true });
        }

        var isCompleted = await db.ProgressEntries.AnyAsync(p => p.UserId == userId && p.TopicId == topic.Id);

        var siblings = await db.Topics
            .Where(t => t.ModuleId == topic.ModuleId && t.IsPublished)
            .OrderBy(t => t.OrderIndex)
            .Select(t => t.Slug)
            .ToListAsync();

        var idx = siblings.IndexOf(topic.Slug);
        var prevSlug = idx > 0 ? siblings[idx - 1] : null;
        var nextSlug = idx < siblings.Count - 1 ? siblings[idx + 1] : null;

        return Ok(new TopicDetailDto(topic.Id, topic.Slug, topic.Title, topic.Content, isCompleted, topic.ModuleId, topic.Module!.Title, nextSlug, prevSlug, idx + 1, siblings.Count));
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<ModuleDetailDto>> CreateModule([FromBody] UpsertModuleRequest request)
    {
        var now = DateTimeOffset.UtcNow;
        var module = new Module
        {
            Id = Guid.NewGuid(),
            Slug = request.Slug,
            Title = request.Title,
            Description = request.Description,
            OrderIndex = request.OrderIndex,
            IsPro = request.IsPro,
            IsPublished = request.IsPublished,
            Price = request.Price,
            Features = request.Features,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Modules.Add(module);
        await db.SaveChangesAsync();

        return Ok(new ModuleDetailDto(module.Id, module.Slug, module.Title, module.Description, module.IsPro, [], module.Price, module.Features));
    }

    [HttpPost("{moduleId:guid}/topics")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<TopicSummaryDto>> CreateTopic(Guid moduleId, [FromBody] UpsertTopicRequest request)
    {
        var moduleExists = await db.Modules.AnyAsync(m => m.Id == moduleId);
        if (!moduleExists)
        {
            return NotFound();
        }

        var now = DateTimeOffset.UtcNow;
        var topic = new Topic
        {
            Id = Guid.NewGuid(),
            ModuleId = moduleId,
            Slug = request.Slug,
            Title = request.Title,
            Content = request.Content,
            OrderIndex = request.OrderIndex,
            IsPublished = request.IsPublished,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Topics.Add(topic);
        await db.SaveChangesAsync();

        return Ok(new TopicSummaryDto(topic.Id, topic.Slug, topic.Title, topic.OrderIndex, false));
    }
}
