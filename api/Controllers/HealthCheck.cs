using Microsoft.AspNetCore.Mvc;
using DoeTech.Services;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/health")]
[ApiVersion("1")] // Define a versão da API
public class HealthCheckController : ControllerBase
{

    private readonly HealthCheckService _healthCheckService;
    
    public HealthCheckController(HealthCheckService healthCheckService)
    {
        _healthCheckService = healthCheckService;
    }

    [HttpGet]
    public IActionResult GetHealthStatus()
    {
        var healthStatus = _healthCheckService.getHealthStatus();

        return Ok(healthStatus);
    }
}