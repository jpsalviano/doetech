using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class EquipmentQueryDto
{
    [JsonProperty("accountId")]
    public Guid? AccountId { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
    
    [JsonProperty("page")]
    public int Page { get; set; } = 1; 
    
    [JsonProperty("pageSize")]
    public int PageSize { get; set; } = 10;
}