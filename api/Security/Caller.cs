using System.Security.Claims;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Security;

// Quem está chamando a API, lido do token JWT. Os controllers usam isto em vez
// de confiar em ids vindos do corpo ou da rota: um usuário só lê e altera o
// que é dele, e o admin pode tudo.
public class Caller
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly AccountRepository _accountRepository;
    private Account _account;
    private bool _accountLoaded;

    public Caller(IHttpContextAccessor httpContextAccessor, AccountRepository accountRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _accountRepository = accountRepository;
    }

    private ClaimsPrincipal Principal => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public bool IsAdmin => Principal?.IsInRole("Admin") == true;

    public Guid UserId =>
        Guid.TryParse(Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

    // A conta (perfil) do usuário logado; null se ele ainda não criou a dele.
    public Account Account
    {
        get
        {
            if (!_accountLoaded && UserId != Guid.Empty)
            {
                _account = _accountRepository.GetByUserId(UserId);
                _accountLoaded = true;
            }
            return _account;
        }
    }

    public Guid AccountId => Account?.Id ?? Guid.Empty;

    public bool OwnsAccount(Guid accountId) => accountId != Guid.Empty && accountId == AccountId;

    public Account RequireAccount()
    {
        return Account ?? throw new ForbiddenException("Complete seu cadastro antes de continuar.");
    }

    public void RequireUserOrAdmin(Guid userId)
    {
        if (!IsAdmin && userId != UserId) throw new ForbiddenException();
    }

    public void RequireAccountOrAdmin(Guid accountId)
    {
        if (!IsAdmin && !OwnsAccount(accountId)) throw new ForbiddenException();
    }
}
