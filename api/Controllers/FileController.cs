using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/file")]
[ApiVersion("1")] // Define a versão da API
[Authorize]
public class FileController : ControllerBase
{
    private readonly FileService _fileService;
    private readonly EquipmentService _equipmentService;
    private readonly Caller _caller;
    private readonly string _publicOrigin;

    public FileController(FileService fileService, EquipmentService equipmentService, Caller caller,
        IConfiguration configuration)
    {
        _fileService = fileService;
        _equipmentService = equipmentService;
        _caller = caller;
        // Origem pública (https://...) para montar links absolutos: atrás do
        // proxy a requisição chega em http, e o app nativo precisa do endereço
        // completo.
        _publicOrigin = configuration["PublicOrigin"]?.TrimEnd('/');
    }

    // Foto de perfil: o web manda o id do usuário e o app o do perfil; os dois
    // valem, desde que sejam de quem está logado. Foto de equipamento: só o
    // doador dele.
    [HttpPost("{type}/{id}")]
    [RequestSizeLimit(FileService.MaxBytes + 64 * 1024)]
    public async Task<IActionResult> Upload(
        [FromRoute] FileType type,
        [FromRoute] Guid id,
        [FromForm] IFormFile file)
    {
        RequireCanWrite(type, id);

        await _fileService.UploadAsync(type, id, file);

        return Ok(new { url = ContentUrl(type, id) });
    }

    [HttpGet("{type}/{id}")]
    public IActionResult GetPresignedUrl(
        [FromRoute] FileType type,
        [FromRoute] Guid id)
    {
        return Ok(new { url = ContentUrl(type, id) });
    }

    // O link assinado é a permissão; não há token aqui.
    [AllowAnonymous]
    [HttpGet("{type}/{id}/content")]
    public IActionResult Content(
        [FromRoute] FileType type,
        [FromRoute] Guid id,
        [FromQuery] long exp,
        [FromQuery] string sig)
    {
        var (content, contentType) = _fileService.Read(type, id, exp, sig);
        Response.Headers.CacheControl = "private, max-age=600";
        Response.Headers["X-Content-Type-Options"] = "nosniff";

        return File(content, contentType);
    }

    private string ContentUrl(FileType type, Guid id)
    {
        var origin = _publicOrigin ?? $"{Request.Scheme}://{Request.Host}";
        var path = $"{Request.PathBase}{Request.Path}".TrimEnd('/');
        return $"{origin}{path}/content?{_fileService.SignedQuery(type, id)}";
    }

    private void RequireCanWrite(FileType type, Guid id)
    {
        if (_caller.IsAdmin) return;

        var ownsId = id == _caller.UserId || _caller.OwnsAccount(id);
        var allowed = type switch
        {
            FileType.EquipmentPicture => _caller.OwnsAccount(_equipmentService.GetEquipmentById(id).DonorAccountId),
            _ => ownsId
        };
        if (!allowed) throw new ForbiddenException();
    }
}
