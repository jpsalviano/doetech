using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace DoeTech.Services;

public class UserLoginService : IService
{
    
    private readonly IConfiguration _configuration;
    private readonly UserRepository _userRepository;
    private readonly AccountService _accountService;
    private readonly EmailService _emailService; 
    private readonly ILogger<ExceptionHandler> _logger;

    private const int TemporaryPasswordSize = 16;

    public UserLoginService(IConfiguration configuration, UserRepository userRepository, AccountService accountService, EmailService emailService, ILogger<ExceptionHandler> logger)
    {
        _configuration = configuration;
        _userRepository = userRepository;
        _accountService = accountService;
        _emailService = emailService;
        _logger = logger;
    }

    public User AddUser(User user)
    {

        if (_userRepository.GetByEmail(user.Email) != null)
        {
            throw new ValidationException("A user with this same email is already registered: " + user.Email);
        }
        
        user.Id = Guid.NewGuid();
        
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        
        _userRepository.Add(user);
        
        user.Password = null;
        
        return user;
    }

    // A senha nova só vale se o e-mail com ela saiu: sem isso, um pedido de
    // recuperação trancaria a conta de qualquer pessoa. A resposta é a mesma
    // exista o e-mail ou não, para não revelar quem tem conta.
    public void RecoverPassword(RecoverPasswordDto recoverPasswordDto)
    {
        if (!_emailService.IsConfigured)
        {
            throw new ValidationException("A recuperação de senha por e-mail está desativada nesta demonstração.");
        }

        var user = _userRepository.GetByEmail(recoverPasswordDto.Email);

        if (user == null)
        {
            return;
        }

        // Gerar nova senha aleatória
        var newPassword = GenerateTemporaryPassword();

        var emailPayload = new EmailPayload()
        {
            To = user.Email,
            Subject = "Recuperação de senha - DoeTech",
            Body = $"Olá! Sua nova senha é: <strong>{newPassword}</strong><br>Recomendamos que você a troque após o login."
        };

        try
        {
            _emailService.SendEmail(emailPayload).Wait();
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Error sending the recovery e-mail: " + exception.Message);
            return;
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        _userRepository.Update(user);
    }
    
    public User Update(Guid userId, User user)
    {
        var userToUpdate = _userRepository.GetById(userId);

        if (userToUpdate == null)
        {
            throw new NotFoundException("User not found: " + userId);
        }
        
        userToUpdate.IsAdmin = user.IsAdmin;
        userToUpdate.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        userToUpdate.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        _userRepository.Update(userToUpdate);

        var updatedUser = new User
        {
            Id = userToUpdate.Id,
            Email = userToUpdate.Email,
            IsAdmin = userToUpdate.IsAdmin,
            UpdatedAt = userToUpdate.UpdatedAt,
            CreatedAt = userToUpdate.CreatedAt,
        };
        
        return updatedUser;
    }
    
    public void RemoveUser(Guid userId)
    {
        var user = _userRepository.GetById(userId);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }
        
        // Checar se existe uma conta não excluída que esteja vinculada a esse usuário
            
        var account = _accountService.GetByUserId(userId);

        if (account != null)
        {
            throw new ValidationException("There are an account linked to this user: " + account.Id);
        }
        
        _userRepository.RemoveById(userId);
    }
    
    public User GetById(Guid id)
    {
        var user = _userRepository.GetById(id);

        if (user == null)
        {
            throw new NotFoundException("User not found");
        }

        var userFound = new User
        {
            Id = user.Id,
            Email = user.Email,
            IsAdmin = user.IsAdmin,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
        
        return userFound;
    }
    
    public IEnumerable<User> Query(UserQueryDto filter)
    {
        return _userRepository.Query(filter);
    }
    
    public IActionResult Login(LoginRequest request)
    {
        var user = _userRepository.GetByEmail(request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            throw new InvalidCredentialsException("Invalid credentials for user");
        }
        
        var token = GenerateToken(user, _configuration);
        
        return new OkObjectResult(new
        {
            token,
            user = new
            {
                id = user.Id,
                email = user.Email,
                isAdmin = user.IsAdmin,
                createdAt = user.CreatedAt
            }
        });
    }
    
    private string GenerateToken(User user, IConfiguration config)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.IsAdmin == true ? "Admin" : "User") 
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(config["Jwt:ExpireMinutes"])),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    private string GenerateTemporaryPassword()
    {
        const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
       
        var random = new Random();
        
        return new string(Enumerable.Repeat(chars, TemporaryPasswordSize)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}