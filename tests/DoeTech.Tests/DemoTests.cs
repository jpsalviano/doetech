using System.Net;
using DoeTech.Demo;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace DoeTech.Tests;

// Banco próprio (outra fixture): o reset apaga tudo.
public class DemoTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly Api _api = new(factory);

    [Fact]
    public async Task Reset_wipes_visitors_and_recreates_the_demo_logins()
    {
        var visitor = await _api.SignUp("Donor");

        factory.Services.GetRequiredService<DemoSeeder>().Reset("demo-senha");

        Assert.Equal(HttpStatusCode.Unauthorized,
            (await _api.Post("/user/login", new { email = visitor.Email, password = "Senha@123" })).Status);

        foreach (var email in new[] { DemoSeeder.DonorEmail, DemoSeeder.ReceptorEmail, DemoSeeder.AdminEmail })
        {
            var login = await _api.Post("/user/login", new { email, password = "demo-senha" });
            Assert.Equal(HttpStatusCode.OK, login.Status);
        }

        var donor = await _api.Post("/user/login", new { email = DemoSeeder.DonorEmail, password = "demo-senha" });
        var token = (string)donor.Json["token"];
        var userId = (string)donor.Json["user"]["id"];
        var account = (await _api.Get($"/account/user/{userId}", token)).Json;
        var donations = await _api.Get($"/donation/query?donorAccountId={account["id"]}&page=1&pageSize=50", token);
        Assert.Equal(3, donations.Json.AsArray().Count);
    }

    [Theory]
    [InlineData("2026-10-21T03:00:00-03:00", 1)]   // antes das 4h: hoje, daqui a 1 h
    [InlineData("2026-10-21T04:00:00-03:00", 24)]  // na hora exata: amanhã
    [InlineData("2026-10-21T23:00:00-03:00", 5)]
    public void Next_reset_is_at_4am_in_Sao_Paulo(string now, int hours)
    {
        Assert.Equal(TimeSpan.FromHours(hours), DemoSeeder.UntilNextReset(DateTimeOffset.Parse(now)));
    }
}
