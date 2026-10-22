using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class Account
{
    [Key] public Guid Id { get; set; }

    [Required(ErrorMessage = "userId is required")]
    [ForeignKey("User")]
    [JsonProperty("userId")]
    public Guid UserId { get; set; }

    [JsonProperty("name")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "name must be between 5 and 100 characters long")]
    public string Name { get; set; }

    [JsonProperty("businessName")]
    [StringLength(100, MinimumLength = 5, ErrorMessage = "businessName must be between 5 and 100 characters long")]
    public string BusinessName { get; set; }

    [JsonProperty("cpf")]
    [StringLength(11, MinimumLength = 11, ErrorMessage = "cpf must have 11 characters without punctuation or dashes")]
    public string Cpf { get; set; }

    [JsonProperty("cnpj")]
    [StringLength(14, MinimumLength = 14, ErrorMessage = "cnpj must have 14 characters without punctuation or dashes")]
    public string Cnpj { get; set; }

    [Required(ErrorMessage = "birthDate is required")]
    [JsonProperty("birthdayDate")]
    public long? BirthdayDate { get; set; }
    
    [Required(ErrorMessage = "address is required")]
    [JsonProperty("address")]
    public AccountAddress Address { get; set; }
    
    [Required(ErrorMessage = "phone is required")]
    [JsonProperty("phone")]
    public AccountPhone Phone { get; set; }
    
    [Required(ErrorMessage = "role is required")]
    [JsonProperty("role")]
    public AccountRoleEnum? Role { get; set; }
    
    [JsonProperty("createdAt")] 
    public long CreatedAt { get; private set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("updatedAt")] 
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [Required(ErrorMessage = "allowsAdvertising is required")]
    [JsonProperty("allowsAdvertising")]
    public bool? AllowsAdvertising { get; set; }

    [JsonProperty("active")]
    public bool Active { get; set; }
    
    [JsonIgnore] 
    public bool Removed { get; set; }
}