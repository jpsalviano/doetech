using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class UserQueryDto
{
    [JsonProperty("email")]
    public string Email { get; set; }
    
    [JsonProperty("isAdmin")]
    public bool? IsAdmin { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
    
    [JsonProperty("page")]
    public int Page { get; set; } = 1; 
    
    [JsonProperty("pageSize")]
    public int PageSize { get; set; } = 10;
}