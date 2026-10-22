using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Services;

public class DonationService : IService
{
    private readonly DonationRepository _donationRepository;
    private readonly EquipmentService _equipmentService;
    private readonly AccountService _accountService;
    private readonly NotificationService _notificationService;
    private readonly EmailService _emailService;
    private readonly UserLoginService _userLoginService;
    private readonly ILogger<ExceptionHandler> _logger;

    private const string DonationAddedNotificationTitle = "Um novo processo de doação foi criado!";

    private const string DonationAddedNotificationContent = """
                                                            Um novo pedido de doação foi criado para sua conta. Vá até a seção de doações e veja agora mesmo!
                                                            """;

    private const string DonationAddedEmailSubject = "Novo processo de doação criado para sua conta no DoeTech";

    private const string DonationAddedEmailBody = """
                                                  Um novo processo de doação foi criado neste momento para sua conta. Acesse 
                                                  agora o Doetech para ter mais informações sobre os equipamentos selecionados, 
                                                  bem como o status da doação. Você será informado sobre novas atualizações no seu processo.
                                                  """;

    private const string DonationChangedStatusNotificationTitle = "Sua doação está no status {0}";

    private const string DonationChangedStatusNotificationContent = """
                                                                    Sua doação foi alterada, o o status mudou de {0} para {1}. Acesse 
                                                                    a seção de doações para mais informações.
                                                                    """;

    private const string DonationApprovedEmailSubject = "Você já pode enviar o seu equipamento para o destinatário";

    private const string DonationApprovedEmailBody = """
                                                     Olá! Temos uma boa notícia! O processo de doação vinculado a um de seus equipamentos foi aprovado!<br>
                                                     Desta forma, você já pode enviar o equipamento ao destinatário. Para isso, utilize as informações abaixo:<br>
                                                     <br>
                                                     Dados do seu equipamento:<br>
                                                     <strong>Descrição: {0}</strong><br>
                                                     <br>
                                                     Dados do destinatário:<br>
                                                     <strong>Nome: {1}</strong><br>
                                                     <strong>Email: {2}</strong><br>
                                                     <strong>Telefone para contato: {3}</strong><br>
                                                     <strong>Endereço completo: {4}</strong><br>
                                                     <br>
                                                     Em caso de dúvida, estaremos aqui para te auxiliar.
                                                     """;

    private const string AccountAddress = "{0}, número {1}, bairro {2} - {3}, {4}. Complemento: {5}, CEP: {6}";
    private const string AddressContact = "({0}) {1}";

    public DonationService(DonationRepository donationRepository, EquipmentService equipmentService,
        AccountService accountService, NotificationService notificationService, EmailService emailService,
        UserLoginService userLoginService,
        ILogger<ExceptionHandler> logger)
    {
        _donationRepository = donationRepository;
        _equipmentService = equipmentService;
        _accountService = accountService;
        _notificationService = notificationService;
        _emailService = emailService;
        _userLoginService = userLoginService;
        _logger = logger;
    }

    public Donation Add(DonationDto dto)
    {
        ValidateDonationRequest(dto);

        var equipments = new List<DonationEquipment>();

        var donationId = Guid.NewGuid();

        var equipmentsToAdd = _equipmentService.GetEquipmentsById(dto.EquipmentIds);

        foreach (var equipment in equipmentsToAdd)
        {
            if (equipment.Removed)
            {
                throw new ValidationException($"Equipment with id {equipment.Id} is removed and cannot be donated");
            }

            if (equipment.Status != EquipmentStatusEnum.Available)
            {
                throw new ValidationException(
                    $"Equipment with id {equipment.Id} is not available for donation or already in process.");
            }

            if (_donationRepository.IsEquipmentInAnotherActiveDonation(equipment.Id, donationId))
            {
                throw new ValidationException(
                    $"Equipment with id {equipment.Id} is already in another active donation");
            }

            LockEquipment(equipment.Id);

            equipments.Add(new DonationEquipment
            {
                Id = Guid.NewGuid(),
                EquipmentId = equipment.Id
            });
        }

        var donation = new Donation
        {
            Id = donationId,
            RecipientAccountId = dto.RecipientAccountId,
            Status = DonationStatusEnum.Pending,
            Removed = false,
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Equipments = equipments
        };

        _donationRepository.Add(donation);

        CreateNotification(dto.RecipientAccountId, DonationAddedNotificationTitle, DonationAddedNotificationContent);
        SendEmail(dto.RecipientAccountId, DonationAddedEmailSubject, DonationAddedEmailBody);

        return donation;
    }


    public List<Donation> GetAllDonations()
    {
        var donations = _donationRepository.GetAll();

        return donations;
    }

    public Donation GetDonationById(Guid id)
    {
        if (id == Guid.Empty) throw new ValidationException("id cannot be null or empty");

        var donation = _donationRepository.GetById(id);

        if (donation == null)
        {
            throw new NotFoundException("Donation not found");
        }

        return donation;
    }

    public Donation UpdateDonation(Guid id, DonationUpdateDto donation)
    {
        ValidateUpdateDonationRequest(donation);

        var existingDonation = _donationRepository.GetById(id);

        if (existingDonation == null)
        {
            throw new NotFoundException("Donation not found");
        }

        if (DonationStatusEnum.Finished.Equals(existingDonation.Status) ||
            DonationStatusEnum.Canceled.Equals(existingDonation.Status))
        {
            throw new ValidationException("Donation is finished or canceled and cannot be updated");
        }

        // Revalidar equipamentos
        var newEquipments = new List<DonationEquipment>();

        var equipmentsToUpdate = _equipmentService.GetEquipmentsById(donation.EquipmentIds);

        foreach (var equipmentToCheck in equipmentsToUpdate)
        {
            if (equipmentToCheck == null)
            {
                throw new ValidationException("Equipment not found");
            }

            if (equipmentToCheck.Removed)
            {
                throw new ValidationException(
                    $"Equipment with id {equipmentToCheck.Id} is removed and cannot be donated");
            }

            if (_donationRepository.IsEquipmentInAnotherActiveDonation(equipmentToCheck.Id, id))
            {
                throw new ValidationException(
                    $"Equipment with id {equipmentToCheck.Id} is already in another active donation");
            }

            LockEquipment(equipmentToCheck.Id);

            newEquipments.Add(new DonationEquipment
            {
                Id = Guid.NewGuid(),
                EquipmentId = equipmentToCheck.Id,
                DonationId = existingDonation.Id
            });
        }

        // Liberar equipamentos para serem doados novamente
        var currentEquipmentListIds = existingDonation.Equipments.Select(e => e.Id).ToList();
        var newEquipmentList = donation.EquipmentIds;
        var notInUpdate = currentEquipmentListIds.Except(newEquipmentList).ToList();

        ReleaseEquipments(notInUpdate);

        // Atualiza os dados da doação

        existingDonation.Equipments.Clear();
        foreach (var e in newEquipments)
        {
            existingDonation.Equipments.Add(e);
        }

        existingDonation.Status = donation.Status;
        existingDonation.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        _donationRepository.Update(existingDonation);

        return existingDonation;
    }


    public void UpdateStatus(Guid id, DonationStatusEnum donationStatus)
    {
        var existingDonation = _donationRepository.GetById(id);

        if (existingDonation == null)
        {
            throw new NotFoundException("Donation not found");
        }

        var previousStatus = existingDonation.Status;

        if (previousStatus == donationStatus)
        {
            throw new ValidationException("Cannot change to same status");
        }

        if (DonationStatusEnum.Finished.Equals(previousStatus) ||
            DonationStatusEnum.Canceled.Equals(previousStatus))
        {
            throw new ValidationException("Donation is finished or canceled and cannot be updated");
        }

        var equipmentList = existingDonation.Equipments.ToList();
        var equipmentIds = equipmentList.Select(a => a.EquipmentId).ToList();

        if (DonationStatusEnum.Finished.Equals(donationStatus) ||
            DonationStatusEnum.Canceled.Equals(donationStatus))
        {
            ReleaseEquipments(equipmentIds);
            existingDonation.FinishedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        }

        existingDonation.Status = donationStatus;
        existingDonation.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        _donationRepository.Update(existingDonation);

        var title = string.Format(DonationChangedStatusNotificationTitle, donationStatus.ToName());
        var content = string.Format(DonationChangedStatusNotificationContent, previousStatus.ToName(),
            donationStatus.ToName());

        CreateNotification(existingDonation.RecipientAccountId, title, content);

        if (DonationStatusEnum.Approved.Equals(donationStatus))
        {
            ChangeEquipmentStatusToOnGoing(equipmentIds);
            SendDonationApprovedEmails(equipmentIds, existingDonation.RecipientAccountId);
        }
    }

    public void RemoveDonationById(Guid donationId, DonationStatusEnum status = DonationStatusEnum.Canceled)
    {
        if (donationId == Guid.Empty)
        {
            throw new ValidationException("id cannot be null or empty");
        }

        var donationToRemove = _donationRepository.GetById(donationId);

        if (donationToRemove == null)
        {
            throw new NotFoundException("donation not found");
        }

        if (status == DonationStatusEnum.InProgress)
        {
            throw new ValidationException("Cannot remove donation with status Available or Pending");
        }

        var equipmentIds = donationToRemove.Equipments.Select(e => e.Id).ToList();

        ReleaseEquipments(equipmentIds);

        _donationRepository.RemoveById(donationId);
    }

    public List<Donation> Query(DonationQueryDto filter)
    {
        return _donationRepository.Query(filter);
    }

    private void ReleaseEquipments(List<Guid> equipmentIds)
    {
        equipmentIds.ForEach(e =>
        {
            try
            {
                _equipmentService.UpdateEquipmentStatus(e, EquipmentStatusEnum.Available);
            }
            catch (NotFoundException exception)
            {
                _logger.LogError($"Not found equipment {e} to change status to Available: {exception.Message}");
            }
        });
    }

    private void ChangeEquipmentStatusToOnGoing(List<Guid> equipmentIds)
    {
        equipmentIds.ForEach(e =>
        {
            try
            {
                _equipmentService.UpdateEquipmentStatus(e, EquipmentStatusEnum.OnGoing);
            }
            catch (NotFoundException exception)
            {
                _logger.LogError($"Not found equipment {e} to change status to Available: {exception.Message}");
            }
        });
    }

    private void LockEquipment(Guid equipmentId)
    {
        try
        {
            _equipmentService.UpdateEquipmentStatus(equipmentId, EquipmentStatusEnum.InProgress);
        }
        catch (NotFoundException exception)
        {
            _logger.LogError($"Not found equipment {equipmentId} to change status to InProgress: {exception.Message}");
        }
    }

    private void ValidateUpdateDonationRequest(DonationUpdateDto donation)
    {
        if (donation == null)
        {
            throw new ValidationException("Donation update data cannot be null");
        }

        if (donation.EquipmentIds == null || donation.EquipmentIds.Count == 0)
        {
            throw new ValidationException("Equipments cannot be empty");
        }
    }

    private void ValidateDonationRequest(DonationDto donation)
    {
        if (donation == null)
        {
            throw new ValidationException("donation cannot be null");
        }

        if (donation.RecipientAccountId == Guid.Empty)
        {
            throw new ValidationException("recipientAccountId cannot be null");
        }

        var recipient = _accountService.GetById(donation.RecipientAccountId);

        if (recipient == null)
        {
            throw new NotFoundException("account not found by id: " + donation.RecipientAccountId);
        }

        if (donation.EquipmentIds == null || donation.EquipmentIds.Count == 0)
        {
            throw new ValidationException("equipmentIds cannot be null or empty");
        }

        var conflictEquipments = _donationRepository.GetEquipmentIdsInActiveDonations(donation.EquipmentIds);

        if (conflictEquipments.Count > 0)
        {
            throw new ValidationException(
                $"The following equipment ids are already part of active donations: {string.Join(", ", conflictEquipments)}"
            );
        }
    }

    private void SendDonationApprovedEmails(List<Guid> equipmentIds, Guid donationAccountId)
    {
        var account = _accountService.GetById(donationAccountId);
        if (account == null)
        {
            return;
        }

        var user = _userLoginService.GetById(account.UserId);

        if (user == null)
        {
            return;
        }
        
        var address = string.Format(AccountAddress, account.Address.Street, account.Address.Number,
            account.Address.District, account.Address.City, account.Address.State, account.Address.Complement,
            account.Address.PostalCode);

        var contact = string.Format(AddressContact, account.Phone.StateCode, account.Phone.Number);
        
        foreach (var equipmentId in equipmentIds)
        {
            try
            {
                var equipment = _equipmentService.GetEquipmentById(equipmentId);

                if (equipment == null)
                {
                    continue;
                }

                var description = equipment.Description;

                var emailBody = string.Format(
                    DonationApprovedEmailBody,
                    description,
                    account.Name,
                    user.Email,
                    contact,
                    address
                );

                SendEmail(equipment.DonorAccountId, DonationApprovedEmailSubject, emailBody);
            }
            catch (NotFoundException exception)
            {
                _logger.LogError($"Not found equipment (id={equipmentId}) to send email: {exception.Message}");
            }
        }

    }

    private void CreateNotification(Guid accountId, string title, string content)
    {
        var notification = new Notification
        {
            Title = title,
            Content = content,
            AccountId = accountId,
            Read = false,
            Removed = false,
            UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        };

        try
        {
            _notificationService.Add(notification);
        }
        catch (Exception exception)
        {
            _logger.LogError($"Failed to create notification ({notification}): {exception.Message}");
        }
    }

    private async void SendEmail(Guid accountId, string emailSubject, string emailBody)
    {
        try
        {
            var account = _accountService.GetById(accountId);
            var user = _userLoginService.GetById(account.UserId);

            var payload = new EmailPayload()
            {
                To = user.Email,
                Subject = emailSubject,
                Body = emailBody
            };

            await _emailService.SendEmail(payload);
        }
        catch (Exception exception)
        {
            _logger.Log(LogLevel.Error, "Error sending email" + exception.Message);
        }
    }
}