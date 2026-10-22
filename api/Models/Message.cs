using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class Message
{
    
    [Key]
    [JsonProperty("id")]
    public Guid Id { get; set; }
    
    [Required]
    [JsonProperty("chatId")]
    public Guid ChatId { get; set; }
    
    [Required]
    [JsonProperty("accountId")]
    public Guid AccountId { get; set; }
    
    [Required]
    [JsonProperty("content")]
    [StringLength(500, MinimumLength = 1, ErrorMessage = "message must be between 1 and 500 characters long")]
    public string Content { get; set; }
    
    [JsonProperty("createdAt")] 
    public long CreatedAt { get; private set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("updatedAt")] 
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonIgnore]
    public Boolean Removed { get; set; }
}