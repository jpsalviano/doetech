using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace DoeTech.Models;

public class Chat
{
    [Key]
    [JsonProperty("id")]
    public Guid Id { get; set; }
    
    [Required]
    [JsonProperty("senderAccountId")]
    public Guid SenderAccountId { get; set; }
    
    [Required]
    [JsonProperty("receiverAccountId")]
    public Guid ReceiverAccountId { get; set; }
    
    [JsonProperty("message")]
    public List<Message> Messages { get; set; }
    
    [JsonProperty("createdAt")] 
    public long CreatedAt { get; private set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    [JsonProperty("updatedAt")] 
    public long UpdatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    
    [JsonIgnore]
    public Boolean Removed { get; set; }
}