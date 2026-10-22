using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class DonationQueryDto
{
    [JsonProperty("recipientAccountId")]
    public Guid? RecipientAccountId { get; set; }
    
    [JsonProperty("donorAccountId")]
    public Guid? DonorAccountId { get; set; }
    
    [JsonProperty("equipmentIds")]
    public List<Guid> EquipmentIds { get; set; }
    
    [JsonProperty("status")]
    public DonationStatusEnum? Status { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
    
    [JsonProperty("page")]
    public int Page { get; set; } = 1; 
    
    [JsonProperty("pageSize")]
    public int PageSize { get; set; } = 10;
}