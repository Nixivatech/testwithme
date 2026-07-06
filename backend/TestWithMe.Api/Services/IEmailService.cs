namespace TestWithMe.Api.Services;

public interface IEmailService
{
    Task SendNewUserAlertAsync(string userName, string userEmail);
}
