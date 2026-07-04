namespace TestWithMe.Api.Models;

public class Certificate
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid ModuleId { get; set; }
    public string StudentNameSnapshot { get; set; } = string.Empty;
    public string ModuleTitleSnapshot { get; set; } = string.Empty;
    public DateTimeOffset IssuedAt { get; set; }

    public User? User { get; set; }
    public Module? Module { get; set; }
}
