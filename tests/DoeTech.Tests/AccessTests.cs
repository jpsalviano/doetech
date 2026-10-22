using System.Net;
using System.Net.Http.Headers;
using Xunit;

namespace DoeTech.Tests;

// Cada teste é um caso que a API original aceitava (ou que não pode quebrar):
// usuários comuns só leem e alteram o que é deles, o admin pode tudo.
public class AccessTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly Api _api = new(factory);

    private void MakeAdmin(Person p) =>
        factory.WithDb(db => db.Users.Single(u => u.Id == p.UserId).IsAdmin = true);

    private async Task<string> Login(Person p, string password = "Senha@123") =>
        (string)(await _api.Post("/user/login", new { email = p.Email, password })).Json["token"];

    // ---------------------------------------------------------------- usuário

    [Fact]
    public async Task SignUp_ignores_isAdmin()
    {
        var r = await _api.Post("/user", new { email = "quer-ser-admin@exemplo.com", password = "Senha@123", isAdmin = true });

        Assert.Equal(HttpStatusCode.OK, r.Status);
        Assert.False((bool?)r.Json["isAdmin"] ?? false);
    }

    [Fact]
    public async Task User_cannot_change_someone_elses_password()
    {
        var victim = await _api.SignUp("Donor");
        var attacker = await _api.SignUp("Donor");

        var r = await _api.Put($"/user/{victim.UserId}", new { password = "Tomada@1", isAdmin = true }, attacker.Token);

        Assert.Equal(HttpStatusCode.Forbidden, r.Status);
        Assert.Equal(HttpStatusCode.Unauthorized, (await _api.Post("/user/login", new { email = victim.Email, password = "Tomada@1" })).Status);
    }

    [Fact]
    public async Task User_changes_own_password_but_not_own_admin_flag()
    {
        var me = await _api.SignUp("Donor");

        var r = await _api.Put($"/user/{me.UserId}", new { password = "NovaSenha@1", isAdmin = true }, me.Token);

        Assert.Equal(HttpStatusCode.OK, r.Status);
        Assert.False((bool?)r.Json["isAdmin"] ?? false);
        Assert.NotNull(await Login(me, "NovaSenha@1"));
    }

    [Fact]
    public async Task Admin_can_promote_a_user()
    {
        var admin = await _api.SignUp("Donor");
        MakeAdmin(admin);
        var token = await Login(admin);
        var other = await _api.SignUp("Donor");

        var r = await _api.Put($"/user/{other.UserId}", new { password = "Senha@123", isAdmin = true }, token);

        Assert.Equal(HttpStatusCode.OK, r.Status);
        Assert.True((bool)r.Json["isAdmin"]);
    }

    [Fact]
    public async Task User_cannot_read_or_list_other_users()
    {
        var a = await _api.SignUp("Donor");
        var b = await _api.SignUp("Donor");

        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/user/{b.UserId}", a.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get("/user/query", a.Token)).Status);
        Assert.Equal(HttpStatusCode.OK, (await _api.Get($"/user/{a.UserId}", a.Token)).Status);
    }

    [Fact]
    public async Task Password_recovery_cannot_lock_anyone_out()
    {
        var victim = await _api.SignUp("Donor");

        var r = await _api.Post("/user/recover", new { email = victim.Email });

        Assert.Equal(HttpStatusCode.BadRequest, r.Status);
        Assert.Contains("desativada", r.Body);
        Assert.NotNull(await Login(victim));
    }

    // ---------------------------------------------------------------- perfil

    [Fact]
    public async Task Anonymous_cannot_create_a_profile_for_an_old_user()
    {
        var created = await _api.Post("/user", new { email = "antigo@exemplo.com", password = "Senha@123" });
        var userId = Guid.Parse((string)created.Json["id"]);
        factory.WithDb(db => db.Users.Single(u => u.Id == userId).CreatedAt =
            DateTimeOffset.UtcNow.AddHours(-2).ToUnixTimeMilliseconds());

        var r = await _api.Post("/account", Api.AccountBody(userId, Cpf.Random(), "Donor"));

        Assert.Equal(HttpStatusCode.Forbidden, r.Status);
    }

    [Fact]
    public async Task Logged_in_user_cannot_create_a_profile_for_someone_else()
    {
        var me = await _api.SignUp("Donor");
        var fresh = await _api.Post("/user", new { email = "sem-perfil@exemplo.com", password = "Senha@123" });

        var r = await _api.Post("/account", Api.AccountBody(Guid.Parse((string)fresh.Json["id"]), Cpf.Random(), "Donor"), me.Token);

        Assert.Equal(HttpStatusCode.Forbidden, r.Status);
    }

    [Fact]
    public async Task User_cannot_edit_someone_elses_profile()
    {
        var victim = await _api.SignUp("Receptor");
        var attacker = await _api.SignUp("Donor");

        var r = await _api.Put($"/account/{victim.AccountId}",
            Api.AccountBody(victim.UserId, victim.Cpf, "Receptor", "Alterado por outro"), attacker.Token);

        Assert.Equal(HttpStatusCode.Forbidden, r.Status);
        var mine = await _api.Put($"/account/{victim.AccountId}",
            Api.AccountBody(victim.UserId, victim.Cpf, "Receptor", "Novo nome"), victim.Token);
        Assert.Equal(HttpStatusCode.OK, mine.Status);
    }

    [Fact]
    public async Task Strangers_see_only_public_fields_counterparts_see_contact()
    {
        var donor = await _api.SignUp("Donor");
        var receptor = await _api.SignUp("Receptor");
        var stranger = await _api.SignUp("Donor");

        var own = await _api.Get($"/account/{receptor.AccountId}", receptor.Token);
        Assert.Equal(receptor.Cpf, (string)own.Json["cpf"]);

        var bystander = await _api.Get($"/account/{receptor.AccountId}", stranger.Token);
        Assert.Equal(HttpStatusCode.OK, bystander.Status);
        Assert.DoesNotContain(receptor.Cpf, bystander.Body);
        Assert.Null(bystander.Json["phone"]);
        Assert.Null(bystander.Json["address"]["street"]);
        Assert.Equal("Belo Horizonte", (string)bystander.Json["address"]["city"]);

        await _api.RequestDonation(receptor, await _api.AddEquipment(donor));
        var counterpart = await _api.Get($"/account/{receptor.AccountId}", donor.Token);
        Assert.DoesNotContain(receptor.Cpf, counterpart.Body);
        Assert.Equal("999990000", (string)counterpart.Json["phone"]["phoneNumber"]);
        Assert.Equal("Rua das Flores", (string)counterpart.Json["address"]["street"]);
    }

    [Fact]
    public async Task Account_query_hides_cpf_and_cannot_search_by_it()
    {
        var a = await _api.SignUp("Donor");
        var b = await _api.SignUp("Receptor");

        var byIds = await _api.Get($"/account/query?accountIds={b.AccountId}&page=1&pageSize=50", a.Token);
        Assert.Equal(HttpStatusCode.OK, byIds.Status);
        Assert.Contains(b.AccountId.ToString(), byIds.Body);
        Assert.DoesNotContain(b.Cpf, byIds.Body);

        var byCpf = await _api.Get($"/account/query?cpf={b.Cpf}&page=1&pageSize=50", a.Token);
        Assert.DoesNotContain(b.Cpf, byCpf.Body);
    }

    [Fact]
    public async Task Profile_by_user_id_is_only_for_its_owner()
    {
        var a = await _api.SignUp("Donor");
        var b = await _api.SignUp("Donor");

        Assert.Equal(HttpStatusCode.OK, (await _api.Get($"/account/user/{a.UserId}", a.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/account/user/{b.UserId}", a.Token)).Status);
    }

    // ---------------------------------------------------------------- equipamentos e doações

    [Fact]
    public async Task Equipment_belongs_to_the_logged_in_donor()
    {
        var donor = await _api.SignUp("Donor");
        var other = await _api.SignUp("Donor");
        var receptor = await _api.SignUp("Receptor");

        var forged = await _api.Post("/equipment", new
        {
            donorAccountId = other.AccountId, description = "Em nome de outro", type = "Tablet",
            status = "OnGoing", avaiabilityDate = 0
        }, donor.Token);
        Assert.Equal(HttpStatusCode.OK, forged.Status);
        Assert.Equal(donor.AccountId.ToString(), (string)forged.Json["donorAccountId"]);
        Assert.Equal("Available", (string)forged.Json["status"]);

        var byReceptor = await _api.Post("/equipment", new
        {
            donorAccountId = receptor.AccountId, description = "x", type = "Tablet", status = "Available", avaiabilityDate = 0
        }, receptor.Token);
        Assert.Equal(HttpStatusCode.Forbidden, byReceptor.Status);

        var id = Guid.Parse((string)forged.Json["id"]);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Put($"/equipment/{id}/status", new { status = "Canceled" }, other.Token)).Status);
        Assert.Equal(HttpStatusCode.OK, (await _api.Put($"/equipment/{id}/status", new { status = "Canceled" }, donor.Token)).Status);
    }

    [Fact]
    public async Task Donation_flow_and_who_may_see_and_change_it()
    {
        var donor = await _api.SignUp("Donor");
        var receptor = await _api.SignUp("Receptor");
        var otherReceptor = await _api.SignUp("Receptor");
        var otherDonor = await _api.SignUp("Donor");
        var equipment = await _api.AddEquipment(donor);

        // O pedido é sempre do receptor logado, seja qual for o id no corpo.
        var forged = await _api.Post("/donation", new { recipientAccountId = otherReceptor.AccountId, equipmentIds = new[] { equipment } }, receptor.Token);
        Assert.Equal(HttpStatusCode.OK, forged.Status);
        Assert.Equal(receptor.AccountId.ToString(), (string)forged.Json["recipientAccountId"]);
        var donation = Guid.Parse((string)forged.Json["id"]);

        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Post("/donation", new { recipientAccountId = donor.AccountId, equipmentIds = new[] { equipment } }, donor.Token)).Status);

        Assert.Equal(HttpStatusCode.OK, (await _api.Get($"/donation/{donation}", receptor.Token)).Status);
        Assert.Equal(HttpStatusCode.OK, (await _api.Get($"/donation/{donation}", donor.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/donation/{donation}", otherReceptor.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/donation/{donation}", otherDonor.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get("/donation", donor.Token)).Status);

        // Só o doador aprova; o receptor não aprova o próprio pedido.
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Put($"/donation/{donation}/status", "\"Approved\"", receptor.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Put($"/donation/{donation}/status", "\"Approved\"", otherDonor.Token)).Status);
        Assert.Equal(HttpStatusCode.OK, (await _api.Put($"/donation/{donation}/status", "\"Approved\"", donor.Token)).Status);
        Assert.Equal("Approved", (string)(await _api.Get($"/donation/{donation}", receptor.Token)).Json["status"]);
    }

    [Fact]
    public async Task Receptor_may_cancel_own_request()
    {
        var donor = await _api.SignUp("Donor");
        var receptor = await _api.SignUp("Receptor");
        var donation = await _api.RequestDonation(receptor, await _api.AddEquipment(donor));

        Assert.Equal(HttpStatusCode.OK, (await _api.Put($"/donation/{donation}/status", "\"Canceled\"", receptor.Token)).Status);
    }

    [Fact]
    public async Task Donation_query_returns_only_your_own()
    {
        var donor = await _api.SignUp("Donor");
        var receptor = await _api.SignUp("Receptor");
        var nosy = await _api.SignUp("Receptor");
        var donation = await _api.RequestDonation(receptor, await _api.AddEquipment(donor));

        var asNosy = await _api.Get($"/donation/query?recipientAccountId={receptor.AccountId}&page=1&pageSize=50", nosy.Token);
        Assert.Equal(HttpStatusCode.OK, asNosy.Status);
        Assert.DoesNotContain(donation.ToString(), asNosy.Body);

        Assert.Contains(donation.ToString(), (await _api.Get($"/donation/query?donorAccountId={donor.AccountId}&page=1&pageSize=50", donor.Token)).Body);
        Assert.Contains(donation.ToString(), (await _api.Get("/donation/query?page=1&pageSize=50", receptor.Token)).Body);
    }

    // ---------------------------------------------------------------- notificações, relatórios, arquivos

    [Fact]
    public async Task Notifications_are_private()
    {
        var donor = await _api.SignUp("Donor");
        var other = await _api.SignUp("Donor");
        await _api.AddEquipment(donor); // gera uma notificação para o doador

        var mine = await _api.Get($"/notification/{donor.AccountId}/all", donor.Token);
        Assert.Equal(HttpStatusCode.OK, mine.Status);
        var notification = (string)mine.Json.AsArray()[0]["id"];

        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/notification/{donor.AccountId}/all", other.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/notification/{notification}", other.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Post($"/notification/{notification}", null, other.Token)).Status);
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Post("/notification", new { title = "x", content = "y", accountId = donor.AccountId }, other.Token)).Status);
        Assert.DoesNotContain(notification, (await _api.Get($"/notification/query?accountId={donor.AccountId}&page=1&pageSize=50", other.Token)).Body);
    }

    [Fact]
    public async Task Reports_chat_and_messages_are_for_admins()
    {
        var user = await _api.SignUp("Donor");
        var admin = await _api.SignUp("Donor");
        MakeAdmin(admin);
        var adminToken = await Login(admin);

        foreach (var path in new[] { "/report/accounts", "/report/donations", "/report/equipments" })
        {
            Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get(path, user.Token)).Status);
            Assert.Equal(HttpStatusCode.OK, (await _api.Get(path, adminToken)).Status);
        }
        Assert.Equal(HttpStatusCode.Forbidden, (await _api.Get($"/chat/{user.AccountId}/all", user.Token)).Status);
    }

    private static MultipartFormDataContent FileForm(byte[] bytes, string contentType)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return new MultipartFormDataContent { { file, "file", "arquivo" } };
    }

    private static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0];

    [Fact]
    public async Task Files_owner_only_upload_signed_read()
    {
        var donor = await _api.SignUp("Donor");
        var other = await _api.SignUp("Donor");
        var equipment = await _api.AddEquipment(donor);

        Assert.Equal(HttpStatusCode.Forbidden,
            (await _api.Send(HttpMethod.Post, $"/file/EquipmentPicture/{equipment}", token: other.Token, content: FileForm(Png, "image/png"))).Status);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await _api.Send(HttpMethod.Post, $"/file/ProfilePicture/{other.UserId}", token: donor.Token, content: FileForm(Png, "image/png"))).Status);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await _api.Send(HttpMethod.Post, $"/file/EquipmentPicture/{equipment}", token: donor.Token,
                content: FileForm("<script>alert(1)</script>"u8.ToArray(), "image/png"))).Status);

        var up = await _api.Send(HttpMethod.Post, $"/file/EquipmentPicture/{equipment}", token: donor.Token, content: FileForm(Png, "image/png"));
        Assert.Equal(HttpStatusCode.OK, up.Status);
        Assert.Equal(HttpStatusCode.OK,
            (await _api.Send(HttpMethod.Post, $"/file/ProfilePicture/{donor.AccountId}", token: donor.Token, content: FileForm(Png, "image/png"))).Status);

        var link = new Uri((string)(await _api.Get($"/file/EquipmentPicture/{equipment}", other.Token)).Json["url"]);
        var http = factory.CreateClient();
        using var image = await http.GetAsync(link.PathAndQuery);
        Assert.Equal(HttpStatusCode.OK, image.StatusCode);
        Assert.Equal("image/png", image.Content.Headers.ContentType?.MediaType);

        using var tampered = await http.GetAsync(link.PathAndQuery.Replace("sig=", "sig=x"));
        Assert.Equal(HttpStatusCode.Forbidden, tampered.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _api.Get($"/file/EquipmentPicture/{Guid.NewGuid()}", donor.Token)).Status);
    }
}
