using System.ComponentModel.DataAnnotations;

namespace DoeTech.Models;

public class DonationEquipment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid DonationId { get; set; }

    [Required]
    public Guid EquipmentId { get; set; }

    public Donation Donation { get; set; }
    public Equipment Equipment { get; set; }
}