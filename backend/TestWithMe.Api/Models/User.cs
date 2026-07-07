namespace TestWithMe.Api.Models;

public enum UserRole
{
    Student,
    Admin
}

public class User
{
    public Guid Id { get; set; }
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.Student;
    public bool IsProMember { get; set; }
    public string? Phone { get; set; }
    public string? Professional { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? LastSeenAt { get; set; }

    public List<Progress> ProgressEntries { get; set; } = [];
    public List<Certificate> Certificates { get; set; } = [];
}
