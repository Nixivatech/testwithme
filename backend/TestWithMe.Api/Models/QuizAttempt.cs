namespace TestWithMe.Api.Models;

public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TopicId { get; set; }
    public int Score { get; set; }
    public int Total { get; set; }
    public bool Passed { get; set; }
    public DateTimeOffset AttemptedAt { get; set; }

    public User? User { get; set; }
    public Topic? Topic { get; set; }
}
