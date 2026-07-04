namespace TestWithMe.Api.Models;

public class Topic
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public bool IsPublished { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Module? Module { get; set; }
    public List<Progress> ProgressEntries { get; set; } = [];
}
