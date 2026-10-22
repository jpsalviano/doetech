using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using ExceptionHandler = System.Web.Http.ExceptionHandling.ExceptionHandler;

namespace DoeTech.Services;

public class AccountActivationService : IService
{
    private readonly AccountRepository _accountRepository;
    private readonly DonationService _donationService;
    private readonly EquipmentService _equipmentService;
    private readonly ILogger<ExceptionHandler> _logger;

    public AccountActivationService(AccountRepository accountRepository, DonationService donationService, EquipmentService equipmentService, ILogger<ExceptionHandler> logger)
    {
        _accountRepository = accountRepository;
        _donationService = donationService;
        _equipmentService = equipmentService;
        _logger = logger;
    }
    
    public void ActivateAccount(Guid accountId)
    {
        var accountToActive = _accountRepository.GetById(accountId);

        if (accountToActive == null)
        {
            throw new NotFoundException("Account not found: " + accountId);
        }

        if (accountToActive.Active)
        {
            throw new ValidationException("Account is already active.");
        }
        accountToActive.Active = true;
        accountToActive.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        _accountRepository.Update(accountToActive);
    }
    
    public void DeactivateAccount(Guid accountId)
    {
        var accountToActive = _accountRepository.GetById(accountId);

        if (accountToActive == null)
        {
            throw new NotFoundException("Account not found: " + accountId);
        }

        if (!accountToActive.Active)
        {
            throw new ValidationException("Account is already not active.");
        }
        
        accountToActive.Active = false;
        accountToActive.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        
        _accountRepository.Update(accountToActive);
        
        ProcessAccountDeactivation(accountId);
    }
    
    private void ProcessAccountDeactivation(Guid accountId)
    {

        var donationQuery = new DonationQueryDto
        {
            RecipientAccountId = accountId
        };

        try
        {
            var donationsToCancel = _donationService.Query(donationQuery);

            donationsToCancel.ForEach(d =>  _donationService.UpdateStatus(d.Id, DonationStatusEnum.Canceled));
        }
        catch (Exception exception)
        {
            _logger.LogError($"Error changing donation status to canceled. Exception: {exception.Message}", exception);
        }

        try
        {
            var equipmentQuery = new EquipmentQueryDto
            {
                AccountId = accountId
            };
            
            var equipmentsToUnlock = _equipmentService.Query(equipmentQuery);
            
            equipmentsToUnlock.ForEach(e => _equipmentService.UpdateEquipmentStatus(e.Id, EquipmentStatusEnum.Available));
        }
        catch (Exception exception)
        {
            _logger.LogError($"Error changing equipment status to canceled. Exception: {exception.Message}", exception);
        }
    }
    
}