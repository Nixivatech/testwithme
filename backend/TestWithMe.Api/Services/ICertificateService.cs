using TestWithMe.Api.Models;

namespace TestWithMe.Api.Services;

public interface ICertificateService
{
    Task<Certificate?> TryIssueCertificateAsync(Guid userId, Guid moduleId);
}
