using System.Text;
using DoeTech.Configurations;
using DoeTech.Exceptions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Converters;
using ApiVersion = Microsoft.AspNetCore.Mvc.ApiVersion;

var builder = WebApplication.CreateBuilder(args);

// Obtêm os dados da aplicação. Obs: se não for encontrado, a aplicação falha ao subir (não opcional).
// Isso não é obirgatório, essa implementação é minha mesmo
builder.Configuration.AddJsonFile("version.json", optional: false, reloadOnChange: true).Build();

// serde JSON C#
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
        options.SerializerSettings.Converters.Add(new StringEnumConverter()); // Serializa todos os enuns para string
    });

builder.Services.AddApiVersioning(options =>
{
    options.AssumeDefaultVersionWhenUnspecified = true; // Se não especificar a versão, usa a padrão
    options.DefaultApiVersion = new ApiVersion(1, 0); // Versão v1
    options.ReportApiVersions = true; // Mostra no header da resposta as versões disponíveis
});

// A chave vem do ambiente (Jwt__Key); sem uma chave de verdade a API não sobe,
// em vez de assinar tokens com um valor de exemplo.
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("Jwt:Key must be set (Jwt__Key) and have at least 32 bytes.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// Adiciona o banco (Postgres) a partir da connection string DatabaseConnection
builder.Services.AddDatabaseConfiguration(builder.Configuration);

// Injeção de dependências (para repositórios e services)
builder.Services.AddRepositories();
builder.Services.AddServices();

// Quem está chamando (lido do token), para as checagens de dono em cada endpoint
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DoeTech.Security.Caller>();

// Contas de exemplo e reset diário, só com Demo__Password definida
builder.Services.AddSingleton<DoeTech.Demo.DemoSeeder>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<DoeTech.Demo.DemoSeeder>());

// Configuração CORS para permitir requisições de origem cruzada do frontend Angular
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    // Em produção o front é servido pela mesma origem da API e não precisa de
    // CORS; a lista serve ao desenvolvimento (ng serve, expo start --web).
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Configurações de envio de email
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

var app = builder.Build();

app.UseCors("AngularPolicy");

// Rodar as migrations de forma automática na base
DatabaseConfig.ApplyMigrations(app.Services);

// Os dois fronts vêm na mesma imagem, em wwwroot: o web (Angular) em /doetech/
// e o app (Expo, versão web) em /doetech/app/. O index.html não fica em cache,
// para um deploy novo valer na hora; o resto tem hash no nome.
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.CacheControl = ctx.File.Name == "index.html"
            ? "no-cache"
            : "public, max-age=604800";
    }
});

app.MapControllers();

// Rotas internas dos fronts (single-page apps) caem no index.html de cada um.
app.MapFallbackToFile("/doetech/app/{*path:nonfile}", "doetech/app/index.html");
app.MapFallbackToFile("/doetech/{*path:nonfile}", "doetech/index.html");

// Configura autenticação
app.UseAuthentication();

// Irá utilizar autenticação em endpoints protegidos
app.UseAuthorization();

// Vamos manipular exceções que lançamos para mapear resposta HTTP válida para o cliente
app.UseMiddleware<ExceptionHandler>();

app.Run();

// Exposto para os testes de integração (WebApplicationFactory<Program>).
public partial class Program { }
