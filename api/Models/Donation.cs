using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;

namespace DoeTech.Models;

[Authorize]
public class Donation
{
    [Key]
    public Guid Id { get; set; }    

    [Required]
    [JsonProperty("recipientAccountId")]
    public Guid RecipientAccountId { get; set; }

    [Required]
    [JsonProperty("equipments")]
    public List<DonationEquipment> Equipments { get; set; }

    [Required]
    [JsonProperty("status")]
    public DonationStatusEnum Status { get; set; }

    [Required]
    [JsonProperty("removed")]
    public bool Removed { get; set; } = false;

    [JsonProperty("createdAt")]
    public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("updatedAt")]
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("finishedAt")]
    public long FinishedAt { get; set; }

    [JsonIgnore] 
    [Timestamp]
    public byte[] RowVersion { get; set; }
}