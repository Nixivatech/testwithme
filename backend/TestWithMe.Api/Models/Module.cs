namespace TestWithMe.Api.Models;

public class Module
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public bool IsPro { get; set; }
    public bool IsPublished { get; set; }
    public decimal? Price { get; set; }
    public string? Features { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public List<Topic> Topics { get; set; } = [];
    public List<Certificate> Certificates { get; set; } = [];
}
