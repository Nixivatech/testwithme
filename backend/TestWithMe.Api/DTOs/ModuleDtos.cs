namespace TestWithMe.Api.DTOs;

public record ModuleSummaryDto(Guid Id, string Slug, string Title, string? Description, bool IsPro, int TopicCount, int CompletedTopicCount, decimal? Price, string? Features);

public record ModuleDetailDto(Guid Id, string Slug, string Title, string? Description, bool IsPro, List<TopicSummaryDto> Topics, decimal? Price, string? Features);

public record TopicSummaryDto(Guid Id, string Slug, string Title, int OrderIndex, bool IsCompleted);

public record TopicDetailDto(Guid Id, string Slug, string Title, string Content, bool IsCompleted, Guid ModuleId, string ModuleTitle, string? NextTopicSlug, string? PrevTopicSlug, int TopicIndex, int TotalTopics);

public record UpsertModuleRequest(string Slug, string Title, string? Description, int OrderIndex, bool IsPro, bool IsPublished, decimal? Price, string? Features);

public record UpsertTopicRequest(string Slug, string Title, string Content, int OrderIndex, bool IsPublished);
