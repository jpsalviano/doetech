using DoeTech.DTOs;

namespace DoeTech.Services;

public interface IEmailService : IService
{
    // Sem SMTP configurado (a demonstração), nada é enviado.
    bool IsConfigured { get; }

    Task SendEmail(EmailPayload payload);
}