namespace TestWithMe.Api.DTOs;

public record ModuleSummaryDto(Guid Id, string Slug, string Title, string? Description, bool IsPro, int TopicCount, int CompletedTopicCount);

public record ModuleDetailDto(Guid Id, string Slug, string Title, string? Description, bool IsPro, List<TopicSummaryDto> Topics);

public record TopicSummaryDto(Guid Id, string Slug, string Title, int OrderIndex, bool IsCompleted);

public record TopicDetailDto(Guid Id, string Slug, string Title, string Content, bool IsCompleted, Guid ModuleId, string ModuleTitle);

public record UpsertModuleRequest(string Slug, string Title, string? Description, int OrderIndex, bool IsPro, bool IsPublished);

public record UpsertTopicRequest(string Slug, string Title, string Content, int OrderIndex, bool IsPublished);
