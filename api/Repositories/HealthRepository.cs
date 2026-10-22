using DoeTech.Data;
using DoeTech.Models;

namespace DoeTech.Repositories;

public class HealthRepository : IRepository
{
    private readonly AppDbContext _context;

    public HealthRepository(AppDbContext context)
    {
        _context = context;
    }

    public IEnumerable<HealthStatus> GetAll() => _context.HealthStatuses.ToList();
}