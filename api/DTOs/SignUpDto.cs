using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

// Cadastro e troca de senha recebem só estes campos: o modelo User inteiro
// deixava qualquer pessoa se cadastrar (ou se promover) como admin.
public class SignUpDto
{
    [Required(ErrorMessage = "email is required")]
    [EmailAddress(ErrorMessage = "email is invalid")]
    [JsonProperty("email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "password is required")]
    [MinLength(6, ErrorMessage = "password must have at least 6 characters")]
    [JsonProperty("password")]
    public string Password { get; set; }
}

public class UserUpdateDto
{
    [Required(ErrorMessage = "password is required")]
    [MinLength(6, ErrorMessage = "password must have at least 6 characters")]
    [JsonProperty("password")]
    public string Password { get; set; }

    // Só um admin pode mudar; para os demais o valor é ignorado.
    [JsonProperty("isAdmin")]
    public bool? IsAdmin { get; set; }
}
