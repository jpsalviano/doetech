using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class AccountQueryDto
{
    [JsonProperty("userId")]
    public Guid? UserId { get; set; }
    
    [JsonProperty("accountIds")]
    public List<Guid> AccountIds { get; set; }
    
    [JsonProperty("name")]
    public string Name { get; set; }
    
    [JsonProperty("businessName")]
    public string BusinessName { get; set; }
    
    [JsonProperty("cpf")]
    public string Cpf { get; set; }
    
    [JsonProperty("cnpj")]
    public string Cnpj { get; set; }
    
    [JsonProperty("allowsAdvertising")]
    public Boolean? AllowsAdvertising { get; set; }

    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
    
    [JsonProperty("page")]
    public int Page { get; set; } = 1; 
    
    [JsonProperty("pageSize")]
    public int PageSize { get; set; } = 10;
}