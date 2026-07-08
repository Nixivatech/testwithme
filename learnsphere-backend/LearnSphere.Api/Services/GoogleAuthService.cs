using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using LearnSphere.Api.Common;

namespace LearnSphere.Api.Services;

public class GoogleAuthService(IOptions<GoogleAuthSettings> options) : IGoogleAuthService
{
    private readonly GoogleAuthSettings _settings = options.Value;

    public async Task<GoogleProfile> VerifyIdTokenAsync(string idToken)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _settings.ClientId }
        });

        return new GoogleProfile(payload.Subject, payload.Email, payload.Name, payload.Picture);
    }
}
