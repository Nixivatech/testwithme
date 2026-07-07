namespace TestWithMe.Api.DTOs;

public record GoogleLoginRequest(string IdToken);

public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string Email, string Name, string? AvatarUrl, string Role, bool IsProMember, string? Phone, string? Professional)
{
    public bool IsProfileComplete => !string.IsNullOrEmpty(Phone) && !string.IsNullOrEmpty(Professional);
}
