using System.ComponentModel.DataAnnotations;
using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class DonationUpdateDto
{
    [Required]
    [JsonProperty("equipmentIds")]
    public List<Guid> EquipmentIds { get; set; }

    [Required]
    [JsonProperty("status")]
    public DonationStatusEnum Status { get; set; }
}