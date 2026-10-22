using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class RecoverPasswordDto
{
    [Required(ErrorMessage = "email is required")]
    [DataType(DataType.EmailAddress)]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    [MaxLength(100)]
    [JsonProperty("email")]
    public string Email { get; set; }
}