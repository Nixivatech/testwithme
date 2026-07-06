using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestWithMe.Api.Common;
using TestWithMe.Api.Data;
using TestWithMe.Api.Models;

namespace TestWithMe.Api.Controllers;

[ApiController]
[Route("api/quiz")]
[Authorize]
public class QuizController(AppDbContext db) : ControllerBase
{
    [HttpGet("topics/{topicId}")]
    public async Task<ActionResult<List<QuestionDto>>> GetQuestions(Guid topicId)
    {
        var questions = await db.Questions
            .Where(q => q.TopicId == topicId)
            .OrderBy(q => q.OrderIndex)
            .Select(q => new QuestionDto(q.Id, q.Text, q.OptionA, q.OptionB, q.OptionC, q.OptionD))
            .ToListAsync();

        return Ok(questions);
    }

    [HttpPost("submit")]
    public async Task<ActionResult<QuizResultDto>> Submit([FromBody] QuizSubmitRequest request)
    {
        var userId = User.GetUserId();

        var questions = await db.Questions
            .Where(q => q.TopicId == request.TopicId)
            .OrderBy(q => q.OrderIndex)
            .ToListAsync();

        if (questions.Count == 0) return BadRequest(new { message = "No questions found for this topic." });

        var answerMap = request.Answers.ToDictionary(a => a.QuestionId, a => a.Answer.ToUpper());

        var results = questions.Select(q =>
        {
            var given = answerMap.TryGetValue(q.Id, out var ans) ? ans : "";
            var correct = q.CorrectAnswer.ToUpper();
            return new QuestionResultDto(q.Id, q.Text, given, correct, given == correct, q.Explanation);
        }).ToList();

        int score = results.Count(r => r.IsCorrect);
        bool passed = score >= (int)Math.Ceiling(questions.Count * 0.6);

        var attemptId = Guid.NewGuid();
        db.QuizAttempts.Add(new QuizAttempt
        {
            Id = attemptId,
            UserId = userId,
            TopicId = request.TopicId,
            Score = score,
            Total = questions.Count,
            Passed = passed,
            AttemptedAt = DateTimeOffset.UtcNow,
        });

        var questionMap = questions.ToDictionary(q => q.Id);
        foreach (var r in results)
        {
            db.QuizAnswerDetails.Add(new QuizAnswerDetail
            {
                Id = Guid.NewGuid(),
                AttemptId = attemptId,
                QuestionId = r.QuestionId,
                QuestionText = questionMap[r.QuestionId].Text,
                CorrectAnswer = questionMap[r.QuestionId].CorrectAnswer,
                GivenAnswer = r.YourAnswer,
                IsCorrect = r.IsCorrect,
            });
        }

        // Mark topic complete if not already
        var alreadyDone = await db.ProgressEntries.AnyAsync(p => p.UserId == userId && p.TopicId == request.TopicId);
        string? certificateCode = null;
        if (!alreadyDone)
        {
            var topic = await db.Topics.Include(t => t.Module).FirstAsync(t => t.Id == request.TopicId);
            db.ProgressEntries.Add(new Progress { Id = Guid.NewGuid(), UserId = userId, TopicId = request.TopicId, CompletedAt = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();

            // Check if all topics in module are now complete
            var moduleTopicIds = await db.Topics
                .Where(t => t.ModuleId == topic.ModuleId && t.IsPublished)
                .Select(t => t.Id)
                .ToListAsync();

            var completedCount = await db.ProgressEntries
                .CountAsync(p => p.UserId == userId && moduleTopicIds.Contains(p.TopicId));

            if (moduleTopicIds.Count > 0 && completedCount == moduleTopicIds.Count)
            {
                var alreadyCert = await db.Certificates.AnyAsync(c => c.UserId == userId && c.ModuleId == topic.ModuleId);
                if (!alreadyCert)
                {
                    var user = await db.Users.FirstAsync(u => u.Id == userId);
                    var code = Guid.NewGuid().ToString("N")[..12].ToUpper();
                    db.Certificates.Add(new Certificate
                    {
                        Id = Guid.NewGuid(),
                        CertificateCode = code,
                        UserId = userId,
                        ModuleId = topic.ModuleId,
                        StudentNameSnapshot = user.Name,
                        ModuleTitleSnapshot = topic.Module!.Title,
                        IssuedAt = DateTimeOffset.UtcNow,
                    });
                    await db.SaveChangesAsync();
                    certificateCode = code;
                }
            }
        }
        else
        {
            await db.SaveChangesAsync();
        }

        return Ok(new QuizResultDto(score, questions.Count, passed, results, certificateCode));
    }

    [HttpGet("full-test")]
    public async Task<ActionResult<List<FullTestQuestionDto>>> GetFullTest()
    {
        var userId = User.GetUserId();

        var completedTopicIds = await db.ProgressEntries
            .Where(p => p.UserId == userId)
            .Select(p => p.TopicId)
            .ToListAsync();

        if (completedTopicIds.Count == 0) return Ok(new List<FullTestQuestionDto>());

        var questions = await db.Questions
            .Include(q => q.Topic)
                .ThenInclude(t => t!.Module)
            .Where(q => completedTopicIds.Contains(q.TopicId))
            .OrderBy(q => q.Topic!.Module!.OrderIndex)
            .ThenBy(q => q.Topic!.OrderIndex)
            .ThenBy(q => q.OrderIndex)
            .Select(q => new FullTestQuestionDto(
                q.Id, q.TopicId, q.Topic!.Title, q.Topic!.Module!.Title,
                q.Text, q.OptionA, q.OptionB, q.OptionC, q.OptionD))
            .ToListAsync();

        return Ok(questions);
    }

    [HttpPost("full-test/submit")]
    public async Task<ActionResult<FullTestResultDto>> SubmitFullTest([FromBody] FullTestSubmitRequest request)
    {
        var userId = User.GetUserId();

        var questionIds = request.Answers.Select(a => a.QuestionId).ToList();
        var questions = await db.Questions
            .Include(q => q.Topic)
                .ThenInclude(t => t!.Module)
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        var answerMap = request.Answers.ToDictionary(a => a.QuestionId, a => a.Answer.ToUpper());

        // Group by topic and create one attempt per topic
        var byTopic = questions.GroupBy(q => q.TopicId).ToList();
        var topicResults = new List<FullTestTopicResultDto>();

        foreach (var grp in byTopic)
        {
            var topicQuestions = grp.ToList();
            var topicAnswers = topicQuestions.Select(q =>
            {
                var given = answerMap.TryGetValue(q.Id, out var ans) ? ans : "";
                return new { q, given, isCorrect = given == q.CorrectAnswer.ToUpper() };
            }).ToList();

            int score = topicAnswers.Count(a => a.isCorrect);
            bool passed = score >= (int)Math.Ceiling(topicQuestions.Count * 0.6);

            var attemptId = Guid.NewGuid();
            db.QuizAttempts.Add(new QuizAttempt
            {
                Id = attemptId,
                UserId = userId,
                TopicId = grp.Key,
                Score = score,
                Total = topicQuestions.Count,
                Passed = passed,
                AttemptedAt = DateTimeOffset.UtcNow,
            });

            foreach (var a in topicAnswers)
            {
                db.QuizAnswerDetails.Add(new QuizAnswerDetail
                {
                    Id = Guid.NewGuid(),
                    AttemptId = attemptId,
                    QuestionId = a.q.Id,
                    QuestionText = a.q.Text,
                    CorrectAnswer = a.q.CorrectAnswer,
                    GivenAnswer = a.given,
                    IsCorrect = a.isCorrect,
                });
            }

            var questionResults = topicAnswers.Select(a =>
                new FullTestQuestionResultDto(a.q.Id, a.q.Text, a.given, a.q.CorrectAnswer, a.isCorrect, a.q.Explanation))
                .ToList();

            topicResults.Add(new FullTestTopicResultDto(
                grp.Key,
                topicQuestions.First().Topic!.Title,
                topicQuestions.First().Topic!.Module!.Title,
                score, topicQuestions.Count, passed, questionResults));
        }

        await db.SaveChangesAsync();

        int totalScore = topicResults.Sum(t => t.Score);
        int totalQuestions = topicResults.Sum(t => t.Total);

        return Ok(new FullTestResultDto(totalScore, totalQuestions, topicResults, DateTimeOffset.UtcNow));
    }

    [HttpGet("history/{topicId}")]
    public async Task<ActionResult<List<QuizSessionDto>>> GetHistory(Guid topicId)
    {
        var userId = User.GetUserId();

        var attempts = await db.QuizAttempts
            .Where(a => a.UserId == userId && a.TopicId == topicId)
            .OrderByDescending(a => a.AttemptedAt)
            .ToListAsync();

        if (attempts.Count == 0) return Ok(new List<QuizSessionDto>());

        var attemptIds = attempts.Select(a => a.Id).ToList();
        var details = await db.QuizAnswerDetails
            .Where(d => attemptIds.Contains(d.AttemptId))
            .ToListAsync();

        var sessions = attempts.Select(a =>
        {
            var answers = details
                .Where(d => d.AttemptId == a.Id)
                .Select(d => new SessionAnswerDto(d.QuestionId, d.QuestionText, d.GivenAnswer, d.CorrectAnswer, d.IsCorrect))
                .ToList();

            return new QuizSessionDto(a.Id, a.Score, a.Total, a.Passed, a.AttemptedAt, answers);
        }).ToList();

        return Ok(sessions);
    }
}

public record QuestionDto(Guid Id, string Text, string OptionA, string OptionB, string OptionC, string OptionD);
public record QuestionResultDto(Guid QuestionId, string Text, string YourAnswer, string CorrectAnswer, bool IsCorrect, string? Explanation);
public record QuizResultDto(int Score, int Total, bool Passed, List<QuestionResultDto> Results, string? CertificateCode);
public record AnswerDto(Guid QuestionId, string Answer);
public record QuizSubmitRequest(Guid TopicId, List<AnswerDto> Answers);
public record SessionAnswerDto(Guid QuestionId, string QuestionText, string GivenAnswer, string CorrectAnswer, bool IsCorrect);
public record QuizSessionDto(Guid AttemptId, int Score, int Total, bool Passed, DateTimeOffset AttemptedAt, List<SessionAnswerDto> Answers);
public record FullTestQuestionDto(Guid Id, Guid TopicId, string TopicTitle, string ModuleTitle, string Text, string OptionA, string OptionB, string OptionC, string OptionD);
public record FullTestQuestionResultDto(Guid QuestionId, string Text, string YourAnswer, string CorrectAnswer, bool IsCorrect, string? Explanation);
public record FullTestTopicResultDto(Guid TopicId, string TopicTitle, string ModuleTitle, int Score, int Total, bool Passed, List<FullTestQuestionResultDto> Questions);
public record FullTestResultDto(int TotalScore, int TotalQuestions, List<FullTestTopicResultDto> Topics, DateTimeOffset TakenAt);
public record FullTestSubmitRequest(List<AnswerDto> Answers);
