using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Services;

public class HealthCheckService : IService
{
    private readonly IConfiguration _configuration;
    private readonly HealthRepository _healthRepository;
    
    public HealthCheckService(IConfiguration configuration, HealthRepository healthRepository)
    {
        _configuration = configuration;
        _healthRepository = healthRepository;
    }

    public HealthStatus getHealthStatus()
    {
        string status;
        var code = 200;
        var name = _configuration["serviceName"] ?? "unknown";
        var version = _configuration["version"] ?? "unknown";
        var build = _configuration["build"] ?? "unknown";
        var releaseDate = _configuration["releaseDate"] ?? "unknown";

        try
        {
            _healthRepository.GetAll();
            status = "Healthy";
        }
        catch (Exception exception)
        {
            Console.WriteLine(exception);
            status = "Unhealthy";
            code = 500;
        }

        return new HealthStatus(name, version, build, releaseDate, status, code);
    }
    
}