namespace TestWithMe.Api.Models;

public class Progress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TopicId { get; set; }
    public DateTimeOffset CompletedAt { get; set; }

    public User? User { get; set; }
    public Topic? Topic { get; set; }
}
