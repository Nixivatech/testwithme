using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Services;

public class CertificateService(AppDbContext db) : ICertificateService
{
    public async Task<Certificate?> TryIssueCertificateAsync(Guid userId, Guid moduleId)
    {
        var existing = await db.Certificates
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ModuleId == moduleId);
        if (existing is not null)
        {
            return existing;
        }

        var module = await db.Modules
            .Include(m => m.Topics)
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.IsPublished);
        if (module is null || module.Topics.Count == 0)
        {
            return null;
        }

        var publishedTopicIds = module.Topics.Where(t => t.IsPublished).Select(t => t.Id).ToList();
        var completedCount = await db.ProgressEntries
            .CountAsync(p => p.UserId == userId && publishedTopicIds.Contains(p.TopicId));

        if (completedCount < publishedTopicIds.Count)
        {
            return null;
        }

        var user = await db.Users.FirstAsync(u => u.Id == userId);

        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            CertificateCode = GenerateCertificateCode(),
            UserId = userId,
            ModuleId = moduleId,
            StudentNameSnapshot = user.Name,
            ModuleTitleSnapshot = module.Title,
            IssuedAt = DateTimeOffset.UtcNow
        };

        db.Certificates.Add(certificate);
        await db.SaveChangesAsync();

        return certificate;
    }

    private static string GenerateCertificateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var buffer = new char[10];
        for (var i = 0; i < buffer.Length; i++)
        {
            buffer[i] = chars[Random.Shared.Next(chars.Length)];
        }
        return $"TWM-{new string(buffer[..5])}-{new string(buffer[5..])}";
    }
}
