using MailKit.Net.Smtp;
using DoeTech.Configurations;
using DoeTech.DTOs;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace DoeTech.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_settings.SmtpServer) && !string.IsNullOrWhiteSpace(_settings.From);

    public async Task SendEmail(EmailPayload payload)
    {
        if (!IsConfigured)
        {
            _logger.LogInformation("E-mail desligado; não enviado: {Subject}", payload.Subject);
            return;
        }

        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(_settings.From));
        email.To.Add(MailboxAddress.Parse(payload.To));
        email.Subject = payload.Subject;
        email.Body = new TextPart("html") { Text = payload.Body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_settings.SmtpServer, _settings.Port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_settings.Username, _settings.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}