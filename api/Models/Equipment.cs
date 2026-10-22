using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class Equipment
{
    [Key] 
    public Guid Id { get; set; }
    
    [Required(ErrorMessage = "DonorAccountId is required")]
    [ForeignKey("Account")]
    [JsonProperty("donorAccountId")]
    public Guid DonorAccountId { get; set; }
    
    [Required(ErrorMessage = "Equipment description is required")]
    [JsonProperty("description")]
    public string Description { get; set; }

    [Required(ErrorMessage = "Equipment type is required")]
    [JsonProperty("type")]
    public EquipmentTypeEnum Type { get; set; }
    
    [Required(ErrorMessage = "Equipment status is required")]
    [JsonProperty("status")]
    public EquipmentStatusEnum Status { get; set; }
    
    [Required(ErrorMessage = "Equipment avaibilityDate is required")]
    [JsonProperty("avaiabilityDate")]
    public long AvaiabilityDate { get; set; }
    
    [JsonProperty("createdAt")]
    public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonProperty("updatedAt")]
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("removed")] 
    public bool Removed { get; set; } = false;
    
    [JsonIgnore]
    [Timestamp]
    public byte[] RowVersion { get; set; }
}