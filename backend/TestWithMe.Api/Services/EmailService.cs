using System.Net;
using System.Net.Mail;

namespace TestWithMe.Api.Services;

public class EmailService(IConfiguration config, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendNewUserAlertAsync(string userName, string userEmail)
    {
        var smtp = config.GetSection("Smtp");
        var host = smtp["Host"];
        var port = int.Parse(smtp["Port"] ?? "587");
        var fromEmail = smtp["FromEmail"];
        var password = smtp["Password"];
        var adminEmail = smtp["AdminEmail"];

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(password))
        {
            logger.LogWarning("SMTP not configured — skipping new user email.");
            return;
        }

        try
        {
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true,
            };

            var body = $"""
                🎉 New student joined Mathilens!

                Name  : {userName}
                Email : {userEmail}
                Time  : {DateTimeOffset.UtcNow:dd MMM yyyy, HH:mm} UTC

                Log in to https://mathilens.com/admin to view all students.
                """;

            var mail = new MailMessage(fromEmail!, adminEmail!)
            {
                Subject = $"New signup: {userName} joined Mathilens",
                Body = body,
            };

            await client.SendMailAsync(mail);
            logger.LogInformation("New user alert sent for {Email}", userEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send new user alert email.");
        }
    }
}
