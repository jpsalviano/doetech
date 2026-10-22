using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class AccountPhone
{
    [Column("PhoneCountryCode")]
    [Required(ErrorMessage = "countryCode is required")]
    [MaxLength(5, ErrorMessage = "countryCode must be between 1 and 5 symbols.")]
    [MinLength(1, ErrorMessage = "countryCode must be between 1 and 5 symbols.")]
    [JsonProperty("countryCode")]
    public string CountryCode { get; set; }
    
    [Column("PhoneStateCode")]
    [Required(ErrorMessage = "stateCode is required")]
    [MaxLength(5, ErrorMessage = "stateCode must be between 1 and 5 symbols.")]
    [MinLength(1, ErrorMessage = "stateCode must be between 1 and 5 symbols.")]
    [JsonProperty("stateCode")]
    public string StateCode { get; set; }
    
    [Column("PhoneNumber")]
    [MaxLength(15, ErrorMessage = "phoneNumber must be between 5 and 15 symbols.")]
    [MinLength(5, ErrorMessage = "phoneNumber must be between 5 and 15 symbols.")]
    [JsonProperty("phoneNumber")]
    public string Number { get; set; }
}