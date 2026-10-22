using DoeTech.Data;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Demo;

// Modo demonstração (Demo__Password definida): ao subir e todo dia às 4h de
// Brasília, apaga tudo (banco e arquivos) e recria três contas de exemplo com
// equipamentos e doações em vários estados. O cadastro fica aberto; o que os
// visitantes criarem some no reset seguinte.
public class DemoSeeder(IServiceProvider services, IConfiguration configuration, ILogger<DemoSeeder> logger)
    : BackgroundService
{
    public const string DonorEmail = "doador@demo.doetech";
    public const string ReceptorEmail = "receptor@demo.doetech";
    public const string AdminEmail = "admin@demo.doetech";

    private static readonly TimeZoneInfo SaoPaulo = TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var password = configuration["Demo:Password"];
        if (string.IsNullOrWhiteSpace(password)) return;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                Reset(password);
                logger.LogInformation("Demonstração reiniciada");
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Falha ao reiniciar a demonstração");
            }

            await Task.Delay(UntilNextReset(DateTimeOffset.UtcNow), stoppingToken);
        }
    }

    public static TimeSpan UntilNextReset(DateTimeOffset now)
    {
        var local = TimeZoneInfo.ConvertTime(now, SaoPaulo);
        var next = new DateTimeOffset(local.Date.AddHours(4), local.Offset);
        if (next <= local) next = next.AddDays(1);
        return next - local;
    }

    public void Reset(string password)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var tables = db.Model.GetEntityTypes()
            .Where(t => t.ClrType != typeof(HealthStatus) && !t.IsOwned())
            .Select(t => $"\"{t.GetTableName()}\"")
            .Distinct();
        // Os nomes vêm do modelo do EF, não de quem chama a API.
#pragma warning disable EF1002
        db.Database.ExecuteSqlRaw($"TRUNCATE {string.Join(", ", tables)} CASCADE");
#pragma warning restore EF1002

        var files = configuration["Files:Root"];
        if (!string.IsNullOrWhiteSpace(files) && Directory.Exists(files))
        {
            foreach (var dir in Directory.GetDirectories(files)) Directory.Delete(dir, recursive: true);
        }

        var hash = BCrypt.Net.BCrypt.HashPassword(password);
        var now = DateTimeOffset.UtcNow;
        long Ago(int days) => now.AddDays(-days).ToUnixTimeMilliseconds();

        Account Person(string email, bool admin, string name, string business, AccountRoleEnum role, string city,
            string district, string cpf, string cnpj)
        {
            var user = new User { Id = Guid.NewGuid(), Email = email, Password = hash, IsAdmin = admin };
            db.Users.Add(user);
            var account = new Account
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = name,
                BusinessName = business,
                Cpf = cpf,
                Cnpj = cnpj,
                BirthdayDate = new DateTimeOffset(1990, 5, 20, 0, 0, 0, TimeSpan.Zero).ToUnixTimeMilliseconds(),
                Role = role,
                AllowsAdvertising = false,
                Active = true,
                Address = new AccountAddress
                {
                    Street = "Rua dos Exemplos",
                    Number = "100",
                    District = district,
                    City = city,
                    State = "Minas Gerais",
                    PostalCode = "30110000"
                },
                Phone = new AccountPhone { CountryCode = "55", StateCode = "31", Number = "900000000" }
            };
            db.Accounts.Add(account);
            return account;
        }

        // CPFs e CNPJ fictícios, mas com dígitos verificadores válidos.
        var donor = Person(DonorEmail, false, "Doador Exemplo", "Tech Doações Ltda.", AccountRoleEnum.Donor,
            "Belo Horizonte", "Savassi", "52998224725", "11222333000181");
        var receptor = Person(ReceptorEmail, false, "Escola Exemplo", "Escola Municipal Exemplo",
            AccountRoleEnum.Receptor, "Contagem", "Eldorado", "15350946056", null);
        Person(AdminEmail, true, "Admin Exemplo", null, AccountRoleEnum.Donor,
            "Belo Horizonte", "Centro", "86288366757", null);

        Equipment Item(string description, EquipmentTypeEnum type, EquipmentStatusEnum status, int days)
        {
            var equipment = new Equipment
            {
                Id = Guid.NewGuid(),
                DonorAccountId = donor.Id,
                Description = description,
                Type = type,
                Status = status,
                AvaiabilityDate = Ago(days),
                CreatedAt = Ago(days)
            };
            db.Equipments.Add(equipment);
            return equipment;
        }

        Item("Notebook Dell Latitude, 8 GB de RAM, SSD de 256 GB", EquipmentTypeEnum.Notebook, EquipmentStatusEnum.Available, 3);
        Item("Monitor LG 22 polegadas com cabo HDMI", EquipmentTypeEnum.Peripherals, EquipmentStatusEnum.Available, 5);
        Item("Tablet Samsung Galaxy Tab A, com capa", EquipmentTypeEnum.Tablet, EquipmentStatusEnum.Available, 9);
        var pc = Item("Desktop Intel Core i5 com teclado e mouse", EquipmentTypeEnum.Desktop, EquipmentStatusEnum.InProgress, 12);
        var phone = Item("Smartphone Motorola Moto G, 64 GB", EquipmentTypeEnum.SmartPhone, EquipmentStatusEnum.OnGoing, 20);
        var old = Item("Notebook Lenovo IdeaPad, bateria nova", EquipmentTypeEnum.Notebook, EquipmentStatusEnum.Finished, 40);

        void Donation(Equipment equipment, DonationStatusEnum status, int days)
        {
            var donation = new Donation
            {
                Id = Guid.NewGuid(),
                RecipientAccountId = receptor.Id,
                Status = status,
                CreatedAt = Ago(days),
                UpdatedAt = Ago(days / 2),
                FinishedAt = status == DonationStatusEnum.Finished ? Ago(days / 2) : 0,
                Equipments = [new DonationEquipment { Id = Guid.NewGuid(), EquipmentId = equipment.Id }]
            };
            db.Donations.Add(donation);
        }

        Donation(pc, DonationStatusEnum.Pending, 2);
        Donation(phone, DonationStatusEnum.Approved, 10);
        Donation(old, DonationStatusEnum.Finished, 30);

        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AccountId = donor.Id,
            Title = "Novo pedido de doação",
            Content = "A Escola Exemplo pediu o desktop Intel Core i5. Aprove ou recuse na tela da doação."
        });
        db.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            AccountId = receptor.Id,
            Title = "Doação aprovada",
            Content = "O smartphone Motorola Moto G foi aprovado. O doador vai entrar em contato para a entrega."
        });

        db.SaveChanges();
    }
}
