using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/account")]
[ApiVersion("1")] // Define a versão da API
public class AccountController : ControllerBase
{
    // O perfil é criado logo depois do usuário, ainda sem login (é assim no
    // web e no app). Sem login, só vale para um usuário recém-criado.
    private static readonly TimeSpan SignUpWindow = TimeSpan.FromMinutes(30);

    private readonly AccountService _accountService;
    private readonly AccountActivationService _accountActivationService;
    private readonly UserRepository _userRepository;
    private readonly DonationRepository _donationRepository;
    private readonly Caller _caller;

    public AccountController(AccountService accountService, AccountActivationService accountActivationService,
        UserRepository userRepository, DonationRepository donationRepository, Caller caller)
    {
        _accountService = accountService;
        _accountActivationService = accountActivationService;
        _userRepository = userRepository;
        _donationRepository = donationRepository;
        _caller = caller;
    }

    [HttpPost]
    public IActionResult Add([FromBody] Account request)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (_caller.IsAuthenticated)
        {
            _caller.RequireUserOrAdmin(request.UserId);
        }
        else
        {
            var user = _userRepository.GetById(request.UserId);
            var createdAt = DateTimeOffset.FromUnixTimeMilliseconds(user?.CreatedAt ?? 0);
            if (user == null || DateTimeOffset.UtcNow - createdAt > SignUpWindow)
                throw new ForbiddenException("Entre na sua conta para completar o cadastro.");
        }

        request.Removed = false;
        var account = _accountService.AddAccount(request);

        return Ok(account);
    }

    [Authorize]
    [HttpPut("{accountId}")]
    public IActionResult Update(Guid accountId, [FromBody] Account request)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _caller.RequireAccountOrAdmin(accountId);

        var user = _accountService.UpdateAccount(accountId, request);

        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{accountId}")]
    public IActionResult Delete(Guid accountId)
    {
        _accountService.RemoveAccount(accountId);

        return NoContent();
    }

    // O dono e o admin veem tudo; quem tem uma doação em comum vê endereço e
    // telefone (para combinar a entrega); os demais, só o público.
    [Authorize]
    [HttpGet("{accountId}")]
    public IActionResult GetById(Guid accountId)
    {
        var account = _accountService.GetById(accountId);

        if (_caller.IsAdmin || _caller.OwnsAccount(accountId))
            return Ok(account);

        if (_caller.AccountId != Guid.Empty && _donationRepository.HaveDonationInCommon(_caller.AccountId, accountId))
            return Ok(AccountView.Contact(account));

        return Ok(AccountView.Public(account));
    }

    // Usado depois do login para carregar o próprio perfil.
    [Authorize]
    [HttpGet("user/{userId}")]
    public IActionResult GetUserId(Guid userId)
    {
        _caller.RequireUserOrAdmin(userId);

        var account = _accountService.GetByUserId(userId);

        return Ok(account);
    }

    // As listagens buscam nomes por id (doadores de equipamentos, receptores
    // de doações): para quem não é admin, só os campos públicos, e sem busca
    // por CPF ou CNPJ.
    [Authorize]
    [HttpGet("query")]
    public IActionResult Query([FromQuery] AccountQueryDto filter)
    {
        if (_caller.IsAdmin)
            return Ok(_accountService.Query(filter));

        filter.Cpf = null;
        filter.Cnpj = null;
        var results = _accountService.Query(filter)
            .Select(a => _caller.OwnsAccount(a.Id) ? (object)a : AccountView.Public(a));

        return Ok(results);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{accountId}/activate")]
    public IActionResult Activate(Guid accountId)
    {
        _accountActivationService.ActivateAccount(accountId);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{accountId}/deactivate")]
    public IActionResult Deactivate(Guid accountId)
    {
        _accountActivationService.DeactivateAccount(accountId);

        return NoContent();
    }
}
