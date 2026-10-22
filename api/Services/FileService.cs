using System.Security.Cryptography;
using System.Text;
using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Services;

// Arquivos (fotos de perfil e de equipamentos, documentos) em disco, um por
// tipo e id, no lugar do Azure Blob. A leitura usa um link assinado que expira
// em 10 minutos, como a SAS do Blob: a tag <img> não manda o token de login,
// então o link em si é a permissão.
public class FileService : IService
{
    public const long MaxBytes = 2 * 1024 * 1024;
    private static readonly TimeSpan Expiration = TimeSpan.FromMinutes(10);

    private readonly string _root;
    private readonly byte[] _signingKey;

    public FileService(IConfiguration configuration)
    {
        _root = configuration["Files:Root"] ?? Path.Combine(AppContext.BaseDirectory, "data", "files");
        // Chave própria derivada da do JWT, para um link de arquivo nunca
        // valer como token e vice-versa.
        _signingKey = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]),
            Encoding.UTF8.GetBytes("doetech-file-links"));
    }

    private string PathFor(FileType type, Guid id) =>
        Path.Combine(_root, type.ToString().ToLowerInvariant(), id.ToString("N"));

    public async Task UploadAsync(FileType type, Guid correlationId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ValidationException("File is empty");
        if (file.Length > MaxBytes)
            throw new ValidationException("File is larger than 2 MB");

        using var buffer = new MemoryStream();
        await file.CopyToAsync(buffer);
        var bytes = buffer.ToArray();

        // O tipo vem do conteúdo, não do Content-Type que o cliente declara.
        if (Sniff(bytes) == null)
            throw new ValidationException("File type not supported (use JPEG, PNG or PDF)");

        var path = PathFor(type, correlationId);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var temp = path + ".tmp";
        await File.WriteAllBytesAsync(temp, bytes);
        File.Move(temp, path, overwrite: true);
    }

    // Query string do link de leitura (?exp=...&sig=...); NotFound se não há arquivo.
    public string SignedQuery(FileType type, Guid correlationId)
    {
        if (!File.Exists(PathFor(type, correlationId)))
            throw new NotFoundException($"File not found by type and correlationId: {type}, {correlationId}");

        var exp = DateTimeOffset.UtcNow.Add(Expiration).ToUnixTimeSeconds();
        return $"exp={exp}&sig={Sign(type, correlationId, exp)}";
    }

    public (byte[] Content, string ContentType) Read(FileType type, Guid correlationId, long exp, string sig)
    {
        var expected = Sign(type, correlationId, exp);
        if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp ||
            sig == null ||
            !CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(expected), Encoding.ASCII.GetBytes(sig)))
            throw new ForbiddenException("Link expired or invalid");

        var path = PathFor(type, correlationId);
        if (!File.Exists(path))
            throw new NotFoundException("File not found");

        var bytes = File.ReadAllBytes(path);
        return (bytes, Sniff(bytes) ?? "application/octet-stream");
    }

    private string Sign(FileType type, Guid id, long exp)
    {
        var mac = HMACSHA256.HashData(_signingKey, Encoding.UTF8.GetBytes($"{type}/{id:N}/{exp}"));
        return Convert.ToBase64String(mac).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static string Sniff(byte[] b)
    {
        if (b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return "image/jpeg";
        if (b.Length >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47) return "image/png";
        if (b.Length >= 5 && Encoding.ASCII.GetString(b, 0, 5) == "%PDF-") return "application/pdf";
        return null;
    }
}
