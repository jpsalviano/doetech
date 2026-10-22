using DoeTech.Demo;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

// As telas de login mostram as contas de exemplo quando a demonstração está
// ligada. A senha é pública de propósito: tudo volta ao estado inicial às 4h.
[Route("api/v{version:apiVersion}/doetech/demo")]
[ApiVersion("1")]
public class DemoController(IConfiguration configuration) : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var password = configuration["Demo:Password"];
        if (string.IsNullOrWhiteSpace(password)) return Ok(new { enabled = false });

        return Ok(new
        {
            enabled = true,
            password,
            resetsAt = "04:00 (horário de Brasília)",
            accounts = new[]
            {
                new { role = "Doador", email = DemoSeeder.DonorEmail },
                new { role = "Receptor", email = DemoSeeder.ReceptorEmail },
                new { role = "Admin", email = DemoSeeder.AdminEmail }
            }
        });
    }
}
