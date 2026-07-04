namespace TestWithMe.Api.Common;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60 * 24 * 7;
}

public class GoogleAuthSettings
{
    public string ClientId { get; set; } = string.Empty;
}
