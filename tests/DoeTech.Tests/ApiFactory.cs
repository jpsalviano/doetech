using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json.Nodes;
using DoeTech.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;
using Xunit;

namespace DoeTech.Tests;

// Sobe a API inteira contra um Postgres de verdade, num banco criado para esta
// execução e apagado no fim. O servidor vem de DOETECH_TEST_DB (no CI, o
// serviço postgres do workflow).
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _server =
        Environment.GetEnvironmentVariable("DOETECH_TEST_DB") ?? "Host=localhost;Username=postgres;Password=dev";
    private readonly string _database = "doetech_test_" + Guid.NewGuid().ToString("N")[..12];
    public readonly string FilesRoot = Path.Combine(Path.GetTempPath(), "doetech-files-" + Guid.NewGuid().ToString("N"));

    public ApiFactory()
    {
        // Lidos no topo do Program.cs, antes de qualquer ConfigureWebHost.
        Environment.SetEnvironmentVariable("ConnectionStrings__DatabaseConnection", $"{_server};Database={_database}");
        Environment.SetEnvironmentVariable("Jwt__Key", "test-only-jwt-signing-key-with-32-bytes-or-more");
        Environment.SetEnvironmentVariable("Files__Root", FilesRoot);
        Environment.SetEnvironmentVariable("PublicOrigin", "http://localhost");
        // Sobe a API agora, enquanto as variáveis acima são as desta fixture.
        _ = Server;
    }

    public void WithDb(Action<AppDbContext> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        action(db);
        db.SaveChanges();
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (!disposing) return;
        NpgsqlConnection.ClearAllPools();
        using var conn = new NpgsqlConnection($"{_server};Database=postgres");
        conn.Open();
        using var cmd = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{_database}\" WITH (FORCE)", conn);
        cmd.ExecuteNonQuery();
        if (Directory.Exists(FilesRoot)) Directory.Delete(FilesRoot, recursive: true);
    }
}

public record Response(HttpStatusCode Status, string Body)
{
    public JsonNode Json => string.IsNullOrWhiteSpace(Body) ? null : JsonNode.Parse(Body);
}

// Um usuário de teste: já cadastrado, com perfil e logado.
public record Person(Guid UserId, string Email, string Token, Guid AccountId, string Cpf);

public class Api(ApiFactory factory)
{
    public const string Base = "/api/v1/doetech";
    private readonly HttpClient _http = factory.CreateClient();

    public async Task<Response> Send(HttpMethod method, string path, object body = null, string token = null,
        HttpContent content = null)
    {
        using var request = new HttpRequestMessage(method, Base + path);
        if (token != null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (content != null) request.Content = content;
        else if (body != null)
            request.Content = new StringContent(
                body as string ?? System.Text.Json.JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
        using var response = await _http.SendAsync(request);
        return new Response(response.StatusCode, await response.Content.ReadAsStringAsync());
    }

    public Task<Response> Get(string path, string token = null) => Send(HttpMethod.Get, path, token: token);
    public Task<Response> Post(string path, object body, string token = null) => Send(HttpMethod.Post, path, body, token);
    public Task<Response> Put(string path, object body, string token = null) => Send(HttpMethod.Put, path, body, token);

    // Cadastro como o web e o app fazem: usuário, perfil sem login, depois login.
    public async Task<Person> SignUp(string role, string password = "Senha@123")
    {
        var email = $"{Guid.NewGuid():N}"[..12] + "@exemplo.com";
        var user = await Post("/user", new { email, password });
        Assert.Equal(HttpStatusCode.OK, user.Status);
        var userId = Guid.Parse((string)user.Json["id"]);

        var cpf = Cpf.Random();
        var account = await Post("/account", AccountBody(userId, cpf, role));
        Assert.True(account.Status == HttpStatusCode.OK, account.Body);

        var login = await Post("/user/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, login.Status);
        return new Person(userId, email, (string)login.Json["token"], Guid.Parse((string)account.Json["id"]), cpf);
    }

    public static object AccountBody(Guid userId, string cpf, string role, string name = "Pessoa de Teste") => new
    {
        userId,
        name,
        cpf,
        role,
        birthdayDate = 631152000000,
        allowsAdvertising = false,
        address = new
        {
            street = "Rua das Flores",
            number = "10",
            district = "Centro",
            city = "Belo Horizonte",
            state = "Minas Gerais",
            postalCode = "30110000"
        },
        phone = new { countryCode = "55", stateCode = "31", phoneNumber = "999990000" }
    };

    public async Task<Guid> AddEquipment(Person donor, string description = "Notebook usado")
    {
        var r = await Post("/equipment", new
        {
            donorAccountId = donor.AccountId,
            description,
            type = "Notebook",
            status = "Available",
            avaiabilityDate = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        }, donor.Token);
        Assert.True(r.Status == HttpStatusCode.OK, r.Body);
        return Guid.Parse((string)r.Json["id"]);
    }

    public async Task<Guid> RequestDonation(Person receptor, params Guid[] equipmentIds)
    {
        var r = await Post("/donation", new { recipientAccountId = receptor.AccountId, equipmentIds }, receptor.Token);
        Assert.True(r.Status == HttpStatusCode.OK, r.Body);
        return Guid.Parse((string)r.Json["id"]);
    }
}

public static class Cpf
{
    private static readonly Random Rng = new();

    // CPF com dígitos verificadores válidos, para passar na validação.
    public static string Random()
    {
        var d = new int[11];
        for (var i = 0; i < 9; i++) d[i] = Rng.Next(10);
        for (var k = 9; k < 11; k++)
        {
            var sum = 0;
            for (var i = 0; i < k; i++) sum += d[i] * (k + 1 - i);
            var r = sum * 10 % 11;
            d[k] = r == 10 ? 0 : r;
        }
        return string.Concat(d);
    }
}
