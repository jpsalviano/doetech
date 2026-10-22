using Microsoft.EntityFrameworkCore;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace DoeTech.Data;

public class AppDbContext : DbContext
{
    
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<Message> Messages { get; set; }
    
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Equipment> Equipments { get; set; }
    public DbSet<Donation> Donations { get; set; }
    public DbSet<DonationEquipment> DonationEquipments { get; set; }
    public DbSet<HealthStatus> HealthStatuses { get; set; }
    
    // Informar ao EF Core que esses atributos são uma composição e devem ser mapeados na mesma tabela
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.OwnsOne(a => a.Phone, phone =>
            {
                phone.Property(p => p.CountryCode).HasColumnName("PhoneCountryCode");
                phone.Property(p => p.StateCode).HasColumnName("PhoneStateCode");
                phone.Property(p => p.Number).HasColumnName("PhoneNumber");
            });

            entity.OwnsOne(a => a.Address, address =>
            {
                address.Property(a => a.Street).HasColumnName("AddressStreet");
                address.Property(a => a.Number).HasColumnName("AddressNumber");
                address.Property(a => a.City).HasColumnName("AddressCity");
                address.Property(a => a.District).HasColumnName("AddressDistrict");
                address.Property(a => a.State).HasColumnName("AddressState");
                address.Property(a => a.Complement).HasColumnName("AddressComplement").IsRequired(false);
                address.Property(a => a.PostalCode).HasColumnName("AddressPostalCode");
            });

            entity.Property(a => a.Role).HasConversion(new EnumToStringConverter<AccountRoleEnum>());
        });
        
        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.Property(e => e.Removed).HasDefaultValue(false);
        });
        
        modelBuilder.Entity<Chat>()
            .HasMany(c => c.Messages)
            .WithOne()
            .HasForeignKey(m => m.ChatId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<Donation>(entity =>
        {
            entity.Property(d => d.Removed).HasDefaultValue(false);
            entity.Property(d => d.Status).HasConversion(new EnumToStringConverter<DonationStatusEnum>());
        });

        modelBuilder.Entity<DonationEquipment>()
            .HasOne(de => de.Donation)
            .WithMany(d => d.Equipments)
            .HasForeignKey(de => de.DonationId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<DonationEquipment>()
            .HasIndex(de => new { de.DonationId, de.EquipmentId })
            .IsUnique();
    }

}