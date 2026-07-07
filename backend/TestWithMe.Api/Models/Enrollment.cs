namespace TestWithMe.Api.Models;

public class Enrollment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ModuleId { get; set; }
    public DateTimeOffset PurchasedAt { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    public User? User { get; set; }
    public Module? Module { get; set; }
}
