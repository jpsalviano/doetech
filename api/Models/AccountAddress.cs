using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class AccountAddress
{

    [Column("AddressStreet")]
    [Required(ErrorMessage = "street is required")]
    [MaxLength(150, ErrorMessage = "street cannot be longer than 150 characters.")]
    [MinLength(5, ErrorMessage = "street cannot be smaller than 5 characters.")]
    [JsonProperty("street")]
    public string Street { get; set; }
    
    [Column("AddressNumber")]
    [Required(ErrorMessage = "number is required")]
    [MaxLength(150, ErrorMessage = "number cannot be longer than 10 characters.")]
    [MinLength(1, ErrorMessage = "number cannot be smaller than 1 characters.")]
    [JsonProperty("number")]
    public string Number { get; set; }
    
    [Column("AddressCity")]
    [Required(ErrorMessage = "city is required")]
    [MaxLength(150, ErrorMessage = "city cannot be longer than 150 characters.")]
    [MinLength(5, ErrorMessage = "city cannot be smaller than 1 characters.")]
    [JsonProperty("city")]
    public string City { get; set; }
    
    [Column("AddressDistrict")]
    [Required(ErrorMessage = "district is required")]
    [MaxLength(150, ErrorMessage = "district cannot be longer than 150 characters.")]
    [MinLength(5, ErrorMessage = "district cannot be smaller than 1 characters.")]
    [JsonProperty("district")]
    public string District { get; set; }
    
    [Column("AddressState")]
    [Required(ErrorMessage = "state is required")]
    [MaxLength(40, ErrorMessage = "state cannot be longer than 40 characters.")]
    [MinLength(4, ErrorMessage = "state cannot be smaller than 4 characters.")]
    [JsonProperty("state")]
    public string State { get; set; }
    
    [Column("AddressComplement")]
    [MaxLength(150, ErrorMessage = "complement cannot be longer than 20 characters.")]
    [JsonProperty("complement")]
    public string? Complement { get; set; }
    
    [Column("AddressPostalCode")]
    [Required(ErrorMessage = "postalCode is required")]
    [MaxLength(15, ErrorMessage = "postalCode cannot be longer than 15 characters.")]
    [MinLength(5, ErrorMessage = "postalCode cannot be smaller than 5 characters.")]
    [JsonProperty("postalCode")]
    public string PostalCode { get; set; }
    

}