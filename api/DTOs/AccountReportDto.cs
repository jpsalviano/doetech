using Newtonsoft.Json;

namespace DoeTech.DTOs;

public class AccountReportDto
{
    [JsonProperty( "addressState")]
    public string AddressState { get; set; }
    
    [JsonProperty("createdAtFrom")]
    public long? CreatedAtFrom { get; set; }
    
    [JsonProperty("createdAtTo")]
    public long? CreatedAtTo { get; set; }
}