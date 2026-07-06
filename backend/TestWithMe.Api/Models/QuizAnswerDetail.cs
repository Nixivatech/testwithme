namespace TestWithMe.Api.Models;

public class QuizAnswerDetail
{
    public Guid Id { get; set; }
    public Guid AttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;  // snapshot at time of attempt
    public string CorrectAnswer { get; set; } = string.Empty; // "A" | "B" | "C" | "D" snapshot
    public string GivenAnswer { get; set; } = string.Empty;   // "A" | "B" | "C" | "D"
    public bool IsCorrect { get; set; }

    public QuizAttempt? Attempt { get; set; }
    public Question? Question { get; set; }
}
