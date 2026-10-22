using System.Reflection;
using DoeTech.Repositories;

namespace DoeTech.Configurations;

public static class RepositoryConfig
{
    public static void AddRepositories(this IServiceCollection services)
    {
        var repositoryInterface = typeof(IRepository);

        // Busca todas as classes que implementam a interface IRepository
        var types = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && repositoryInterface.IsAssignableFrom(t));

        // Adiciona cada repositório como Scoped
        foreach (var type in types)
        {
            services.AddScoped(type);
        }
    }
}
