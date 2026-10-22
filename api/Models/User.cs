using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class User
{
    [Key]
    public Guid Id { get; set; }

    [Required(ErrorMessage = "email is required")]
    [DataType(DataType.EmailAddress)]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    [MaxLength(100)]
    [JsonProperty("email")]
    public string Email { get; set; }

    [Required(ErrorMessage = "password is required")]
    [MaxLength(100)]
    [JsonProperty("password")]
    public string Password { get; set; }
    
    [Required(ErrorMessage = "isAdmin is required")]
    [JsonProperty("isAdmin")]
    public bool? IsAdmin { get; set; }

    [JsonProperty("createdAt")]
    public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonProperty("updatedAt")]
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonIgnore]
    public Boolean Removed { get; set; }
}