namespace TestWithMe.Api.Models;

public class PriceView
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ModuleId { get; set; }
    public DateTimeOffset ViewedAt { get; set; }

    public User? User { get; set; }
    public Module? Module { get; set; }
}
