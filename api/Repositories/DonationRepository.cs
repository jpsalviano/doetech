using DoeTech.Data;
using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using Microsoft.EntityFrameworkCore;

namespace DoeTech.Repositories;

public class DonationRepository : IRepository
{
    private readonly AppDbContext _dbContext;

    public DonationRepository(AppDbContext context)
    {
        _dbContext = context;
    }

    public void Add(Donation donation)
    {
        _dbContext.Donations.Add(donation);
        _dbContext.SaveChanges();
    }

    public Donation GetById(Guid id)
    {
        return _dbContext.Donations
            .Include(d => d.Equipments)
            .FirstOrDefault(d => d.Id == id);
    }

    public List<Donation> GetAll()
    {
        return _dbContext.Donations
            .Include(d => d.Equipments)
            .Where(d => !d.Removed)
            .ToList();
    }


    public void Update(Donation donation)
    {
        donation.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _dbContext.Donations.Update(donation);

        try
        {
            _dbContext.SaveChanges();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Obtenha as entradas que causaram o conflito
            var conflictingEntries = ex.Entries;

            foreach (var entry in conflictingEntries)
            {
                if (entry.Entity is Donation conflictingDonation)
                {
                    // Recarregue os dados do banco para resolver o conflito
                    var databaseEntry = entry.GetDatabaseValues();
                    if (databaseEntry == null)
                    {
                        throw new NotFoundException("Donation não encontrada no banco de dados.");
                    }

                    // Atualize os valores locais com os valores do banco
                    entry.OriginalValues.SetValues(databaseEntry);
                }
            }
        }
    }

    public void RemoveById(Guid donationId)
    {

        var donation = _dbContext.Donations.FirstOrDefault(d => d.Id == donationId && !d.Removed);

        if (donation == null)
        {
            throw new NotFoundException("Donation not found by id: " + donationId);
        }

        donation.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        donation.Removed = true;

        _dbContext.Donations.Update(donation);
        _dbContext.SaveChanges();
    }

    public bool IsEquipmentInActiveDonation(Guid equipmentId)
    {
        return _dbContext.Donations
            .Include(d => d.Equipments)
            .Any(d => 
                !d.Removed &&
                d.Status == DonationStatusEnum.InProgress &&
                d.Equipments.Any(e => e.EquipmentId == equipmentId)
            );
    }

    public List<Guid> GetEquipmentIdsInActiveDonations(List<Guid> equipmentIds)
    {
        return _dbContext.Donations
            .Where(d => 
                !d.Removed &&
                d.Status == DonationStatusEnum.InProgress &&
                d.Equipments.Any(e => equipmentIds.Contains(e.EquipmentId)))
            .SelectMany(d => d.Equipments)
            .Where(e => equipmentIds.Contains(e.EquipmentId))
            .Select(e => e.EquipmentId)
            .Distinct()
            .ToList();
    }

    public bool IsEquipmentInAnotherActiveDonation(Guid equipmentId, Guid donationId)
    {
        return _dbContext.DonationEquipments
            .Include(de => de.Donation)
            .Any(de =>
                de.EquipmentId == equipmentId &&
                de.DonationId != donationId &&
                !de.Donation.Removed &&
                de.Donation.Status != DonationStatusEnum.Finished &&
                de.Donation.Status != DonationStatusEnum.Canceled);
    }

    // Contas doadoras dos equipamentos de uma doação.
    public List<Guid> GetDonorAccountIds(Guid donationId)
    {
        return _dbContext.DonationEquipments
            .Where(de => de.DonationId == donationId)
            .Join(_dbContext.Equipments, de => de.EquipmentId, eq => eq.Id, (de, eq) => eq.DonorAccountId)
            .Distinct()
            .ToList();
    }

    // Se as duas contas estão numa mesma doação, uma como receptora e a outra
    // como doadora de algum equipamento dela.
    public bool HaveDonationInCommon(Guid accountA, Guid accountB)
    {
        return _dbContext.Donations
            .Where(d => !d.Removed && (d.RecipientAccountId == accountA || d.RecipientAccountId == accountB))
            .Any(d => d.Equipments.Any(de => _dbContext.Equipments.Any(eq =>
                eq.Id == de.EquipmentId &&
                ((d.RecipientAccountId == accountA && eq.DonorAccountId == accountB) ||
                 (d.RecipientAccountId == accountB && eq.DonorAccountId == accountA)))));
    }

    public List<Donation> Query(DonationQueryDto filter)
    {
        var query = _dbContext.Donations
            .Include(d => d.Equipments)
            .AsQueryable();

        if (filter.Status != null) {
            query = query.Where(d => filter.Status.Equals(d.Status));
        }
        
        if (filter.RecipientAccountId != null)
        {
            query = query.Where(d => d.RecipientAccountId == filter.RecipientAccountId);
        }
        
        if (filter.EquipmentIds != null && filter.EquipmentIds.Any())
        {
            query = query.Where(d => d.Equipments.Any(e => filter.EquipmentIds.Contains(e.EquipmentId)));
        }

        if (filter.DonorAccountId != null)
        {
            query = query.Where(d => d.Equipments
                .Any(de => _dbContext.Equipments
                    .Any(eq => eq.Id == de.EquipmentId && eq.DonorAccountId == filter.DonorAccountId)));
        }
        
        if (filter.CreatedAtFrom != null)
        {
            query = query.Where(a => a.CreatedAt >= filter.CreatedAtFrom);
        }

        if (filter.CreatedAtTo != null)
        {
            query = query.Where(a => a.CreatedAt <= filter.CreatedAtTo);
        }

        query = query
            .OrderBy(d => d.UpdatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize);

        return query
            .ToList();
    }
    
    public List<Donation> QueryReport(DonationReportDto filter)
    {
        var query = _dbContext.Donations
            .Include(d => d.Equipments)
            .ThenInclude(de => de.Equipment)
            .Where(d => !d.Removed)
            .AsQueryable();

        if (filter.Status != null)
        {
            query = query.Where(d => d.Status == filter.Status);
        }

        if (filter.CreatedAtFrom != null)
        {
            query = query.Where(d => d.CreatedAt >= filter.CreatedAtFrom.Value);
        }

        if (filter.CreatedAtTo != null)
        {
            query = query.Where(d => d.CreatedAt <= filter.CreatedAtTo.Value);
        }

        if (filter.Type != null)
        {
            query = query.Where(d => d.Equipments
                .Any(de => _dbContext.Equipments
                    .Any(e => e.Id == de.EquipmentId && e.Type == filter.Type)));
        }

        if (!string.IsNullOrWhiteSpace(filter.AddressState))
        {
            query = query.Where(d => d.Equipments.Any(de =>
                _dbContext.Equipments
                    .Join(_dbContext.Accounts,
                        e => e.DonorAccountId,
                        a => a.Id,
                        (e, a) => new { e.Id, a.Address.State })
                    .Any(x => x.Id == de.EquipmentId && x.State == filter.AddressState)
            ));
        }

        query = query.OrderByDescending(d => d.CreatedAt);

        return query.ToList();
    }
}