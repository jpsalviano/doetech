using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class EquipmentReportDto
{
    [JsonProperty( "addressState")]
    public string AddressState { get; set; }
    
    [JsonProperty("type")]
    public EquipmentTypeEnum? Type { get; set; }
    
    [JsonProperty("status")]
    public EquipmentStatusEnum? Status { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
}