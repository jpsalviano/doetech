using DoeTech.DTOs;
using DoeTech.Models;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/user")]
[ApiVersion("1")] // Define a versão da API
public class AuthController : ControllerBase
{
    private readonly UserLoginService _loginService;
    private readonly Caller _caller;

    public AuthController(UserLoginService loginService, Caller caller)
    {
        _loginService = loginService;
        _caller = caller;
    }

    // Cadastro aberto: sempre cria um usuário comum, seja o que for que venha
    // em isAdmin.
    [HttpPost]
    public IActionResult Add([FromBody] SignUpDto request)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = _loginService.AddUser(new User
        {
            Email = request.Email,
            Password = request.Password,
            IsAdmin = false
        });

        return Ok(user);
    }

    // Cada um troca a própria senha; só o admin troca a de outro ou muda isAdmin.
    [Authorize]
    [HttpPut("{userId}")]
    public IActionResult Update(Guid userId, [FromBody] UserUpdateDto request)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _caller.RequireUserOrAdmin(userId);

        var current = _loginService.GetById(userId);
        var user = _loginService.Update(userId, new User
        {
            Password = request.Password,
            IsAdmin = _caller.IsAdmin && request.IsAdmin != null ? request.IsAdmin : current.IsAdmin
        });

        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{userId}")]
    public IActionResult Delete(Guid userId)
    {
        _loginService.RemoveUser(userId);

        return NoContent();
    }

    [Authorize]
    [HttpGet("{userId}")]
    public IActionResult Get(Guid userId)
    {
        _caller.RequireUserOrAdmin(userId);

        var user = _loginService.GetById(userId);

        return Ok(user);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("query")]
    public IActionResult Query([FromQuery] UserQueryDto filter)
    {
        var results = _loginService.Query(filter);

        return Ok(results);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        return _loginService.Login(request);
    }

    [HttpPost("recover")]
    public IActionResult RecoverPassword([FromBody] RecoverPasswordDto request)
    {

        _loginService.RecoverPassword(request);

        return Ok();
    }
}
