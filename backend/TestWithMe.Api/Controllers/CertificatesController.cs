using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.DTOs;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/certificates")]
public class CertificatesController(AppDbContext db) : ControllerBase
{
    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<List<CertificateDto>>> GetMine()
    {
        var userId = User.GetUserId();

        var certificates = await db.Certificates
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto(c.CertificateCode, c.StudentNameSnapshot, c.ModuleTitleSnapshot, c.IssuedAt))
            .ToListAsync();

        return Ok(certificates);
    }

    // Public verification endpoint — no auth required, matches /verify/{certificate-id} on the frontend.
    [HttpGet("verify/{certificateCode}")]
    public async Task<ActionResult<CertificateVerificationDto>> Verify(string certificateCode)
    {
        var certificate = await db.Certificates
            .FirstOrDefaultAsync(c => c.CertificateCode == certificateCode);

        if (certificate is null)
        {
            return Ok(new CertificateVerificationDto(false, null));
        }

        var dto = new CertificateDto(certificate.CertificateCode, certificate.StudentNameSnapshot,
            certificate.ModuleTitleSnapshot, certificate.IssuedAt);

        return Ok(new CertificateVerificationDto(true, dto));
    }
}
