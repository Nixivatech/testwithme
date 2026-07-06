namespace TestWithMe.Api.Models;

public class Question
{
    public Guid Id { get; set; }
    public Guid TopicId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string OptionA { get; set; } = string.Empty;
    public string OptionB { get; set; } = string.Empty;
    public string OptionC { get; set; } = string.Empty;
    public string OptionD { get; set; } = string.Empty;
    public string CorrectAnswer { get; set; } = string.Empty; // "A" | "B" | "C" | "D"
    public string? Explanation { get; set; }
    public int OrderIndex { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public Topic? Topic { get; set; }
}
