using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class Notification
{
    
    [Key]
    [JsonProperty("id")]
    public Guid Id { get; set; }
    
    [Required]
    [JsonProperty("title")]
    [StringLength(250, MinimumLength = 3, ErrorMessage = "content must be between 3 and 250 characters")]
    public string Title { get; set; }

    [Required]
    [StringLength(600, MinimumLength = 3, ErrorMessage = "content must be between 3 and 600 characters")]
    [JsonProperty("content")]
    public string Content { get; set; }
    
    [JsonProperty("accountId")]
    public Guid AccountId { get; set; }
    
    [JsonProperty("read")]
    public bool Read { get; set; }
    
    [JsonProperty("createdAt")] 
    public long CreatedAt { get; private set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("updatedAt")] 
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonIgnore]
    public Boolean Removed { get; set; }
}