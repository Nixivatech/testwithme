using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;
using TestWithMe.Api.Services;

namespace TestWithMe.Api.Controllers;

public record CompleteTopicRequest(Guid TopicId);

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController(AppDbContext db, ICertificateService certificateService) : ControllerBase
{
    [HttpPost("complete")]
    public async Task<IActionResult> CompleteTopic([FromBody] CompleteTopicRequest request)
    {
        var userId = User.GetUserId();

        var topic = await db.Topics.Include(t => t.Module).FirstOrDefaultAsync(t => t.Id == request.TopicId);
        if (topic is null || !topic.IsPublished)
        {
            return NotFound();
        }

        var alreadyCompleted = await db.ProgressEntries
            .AnyAsync(p => p.UserId == userId && p.TopicId == request.TopicId);

        if (!alreadyCompleted)
        {
            db.ProgressEntries.Add(new Progress
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TopicId = request.TopicId,
                CompletedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
        }

        var certificate = await certificateService.TryIssueCertificateAsync(userId, topic.ModuleId);

        return Ok(new
        {
            completed = true,
            certificateIssued = certificate is not null,
            certificateCode = certificate?.CertificateCode
        });
    }
}
