using DoeTech.Data;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Configurations;

public static class DatabaseConfig
{
    public static void AddDatabaseConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        // No servidor o banco vem como URL (DOETECH_DATABASE_URL, o formato que o
        // jpsalviano.com.br grava para todos os apps); no desenvolvimento, como
        // connection string do Npgsql.
        var url = configuration["DOETECH_DATABASE_URL"];
        var connectionString = string.IsNullOrWhiteSpace(url)
            ? configuration.GetConnectionString("DatabaseConnection")
            : FromUrl(url);

        // Adiciona o DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));
    }

    // postgresql[+driver]://usuario:senha@host:porta/banco -> connection string do Npgsql
    public static string FromUrl(string url)
    {
        var uri = new Uri(System.Text.RegularExpressions.Regex.Replace(url, @"^postgres(ql)?(\+\w+)?://", "postgresql://"));
        var credentials = uri.UserInfo.Split(':', 2);
        var builder = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.IsDefaultPort || uri.Port < 0 ? 5432 : uri.Port,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = credentials.Length > 1 ? Uri.UnescapeDataString(credentials[1]) : null
        };
        return builder.ConnectionString;
    }

    public static void ApplyMigrations(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        try
        {
            dbContext.Database.Migrate(); // Aplica as migrations pendentes
            Console.WriteLine("Migrations applied successfully.");
        }
        catch (Exception ex)
        {
            // Sem banco a API não funciona: melhor cair e o health check (e o
            // deploy) acusarem do que subir respondendo 500 em tudo.
            Console.WriteLine($"Error applying migrations: {ex.Message}");
            throw;
        }
    }
}