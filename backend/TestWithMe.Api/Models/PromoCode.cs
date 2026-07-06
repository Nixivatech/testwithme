namespace TestWithMe.Api.Models;

public class PromoCode
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public Guid? ModuleId { get; set; }  // null = valid for any module
    public int MaxUses { get; set; } = 1;
    public int UsedCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }

    public Module? Module { get; set; }
}
