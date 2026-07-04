using System.Security.Claims;

namespace TestWithMe.Api.Common;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? principal.FindFirstValue("sub");
        return Guid.Parse(sub ?? throw new InvalidOperationException("Token has no subject claim."));
    }

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole("Admin");
}
