using TestWithMe.Api.Models;

namespace TestWithMe.Api.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
