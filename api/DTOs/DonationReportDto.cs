using System.ComponentModel.DataAnnotations;
using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class DonationReportDto
{
    [JsonProperty( "addressState")]
    public string AddressState { get; set; }
    
    [JsonProperty("equipmentType")]
    public EquipmentTypeEnum? Type { get; set; }
    
    [JsonProperty("status")]
    public DonationStatusEnum? Status { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
}