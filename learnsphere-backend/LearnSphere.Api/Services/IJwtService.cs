using LearnSphere.Api.Models;

namespace LearnSphere.Api.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}
