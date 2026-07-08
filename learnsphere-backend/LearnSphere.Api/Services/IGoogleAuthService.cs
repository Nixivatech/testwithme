namespace LearnSphere.Api.Services;

public record GoogleProfile(string GoogleId, string Email, string Name, string? AvatarUrl);

public interface IGoogleAuthService
{
    Task<GoogleProfile> VerifyIdTokenAsync(string idToken);
}
