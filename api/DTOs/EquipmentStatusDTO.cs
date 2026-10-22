using System.ComponentModel.DataAnnotations;
using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class EquipmentStatusDTO
{
    [Required] [JsonProperty("status")] public EquipmentStatusEnum Status { get; set; }
}