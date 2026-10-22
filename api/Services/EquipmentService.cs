using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using ExceptionHandler = System.Web.Http.ExceptionHandling.ExceptionHandler;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace DoeTech.Services;

public class EquipmentService : IService
{
    private readonly AccountService _accountService;
    private readonly UserLoginService _userLoginService;
    private readonly EquipmentRepository _equipmentRepository;
    private readonly EmailService _emailService;
    private readonly NotificationService _notificationService;
    private readonly ILogger<ExceptionHandler> _logger;


    private const string EquipmentAddedNotificationTitle = "Um novo equipamento foi cadastrado na sua conta";

    private const string EquipmentAddedNotificationContent = """
                                                             Olá! Um novo equipamento foi cadastrado para doação em sua conta, com descrição {0}. 
                                                             Acesse a seção de equipamentos para ver mais.
                                                             """;

    private const string EquipmentChangedStatusNotificationTitle = "Seu equipamento foi alterado para o status: {0}";

    private const string EquipmentChangedStatusNotificationContent = """
                                                                     Olá! Seu equipamento teve o status de disponibilidade alterado de {0} para {1}. 
                                                                     Acesse a seção de equipamentos para ver mais.
                                                                     """;

    private const string EquipmentOnGoingNotificationTitle = "Você já pode enviar seu equipamento!";

    private const string EquipmentOnGoingNotificationContent = """
                                                               Temos uma boa notícia! O processo de doação do seu equipamento foi aprovado e você 
                                                               já pode enviar o equipamento para o destinatário! Você receberá um email com mais informações 
                                                               em breve.
                                                               """;

    public EquipmentService(EquipmentRepository equipmentRepository, ILogger<ExceptionHandler> logger,
        UserLoginService userLoginService, AccountService accountService, NotificationService notificationService,
        EmailService emailService)
    {
        _equipmentRepository = equipmentRepository;
        _logger = logger;
        _userLoginService = userLoginService;
        _accountService = accountService;
        _notificationService = notificationService;
        _emailService = emailService;
    }

    public Equipment AddEquipment(Equipment equipment)
    {
        if (equipment == null)
        {
            throw new ValidationException("Equipment cannot be null");
        }

        var accountId = equipment.DonorAccountId;

        if (accountId == Guid.Empty)
        {
            throw new ValidationException("DonorAccountId cannot be empty");
        }

        var account = _accountService.GetById(accountId);

        if (account == null)
        {
            throw new NotFoundException("Account not found");
        }

        equipment.Id = Guid.NewGuid();
        equipment.DonorAccountId = equipment.DonorAccountId;
        equipment.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        _equipmentRepository.Add(equipment);

        SendEquipmentAddedEmail(equipment);

        var notificationContent = string.Format(EquipmentAddedNotificationContent, equipment.Description);

        CreateNotification(accountId, EquipmentAddedNotificationTitle, notificationContent);

        return equipment;
    }

    public List<Equipment> GetEquipments()
    {
        return _equipmentRepository.GetList();
    }

    public Equipment GetEquipmentById(Guid equipmentId)
    {
        var equipment = _equipmentRepository.GetById(equipmentId);
        if (equipment == null)
        {
            throw new NotFoundException("Equipment not found");
        }

        return equipment;
    }

    public List<Equipment> GetEquipmentsById(List<Guid> equipmentIds)
    {
        return _equipmentRepository.GetByIds(equipmentIds);
    }

    public Equipment UpdateEquipmentStatus(Guid equipmentId, EquipmentStatusEnum newStatus)
    {
        var equipmentToUpdate = _equipmentRepository.GetById(equipmentId);

        if (equipmentToUpdate == null)
        {
            throw new NotFoundException("Equipment not found");
        }

        var previousStatus = equipmentToUpdate.Status;

        equipmentToUpdate.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        equipmentToUpdate.Status = newStatus;

        if (newStatus is EquipmentStatusEnum.Canceled or EquipmentStatusEnum.Finished)
        {
            equipmentToUpdate.Removed = true;
        }

        _equipmentRepository.Update(equipmentToUpdate);

        if (EquipmentStatusEnum.OnGoing.Equals(previousStatus))
        {
            CreateNotification(equipmentToUpdate.DonorAccountId, EquipmentOnGoingNotificationTitle, EquipmentOnGoingNotificationContent);
        }
        else
        {
            var newStatusName = newStatus.ToName();
            var notificationTitle = string.Format(EquipmentChangedStatusNotificationTitle, newStatusName);
            var notificationContent = string.Format(EquipmentChangedStatusNotificationContent, previousStatus.ToName(), newStatusName);
            
            CreateNotification(equipmentToUpdate.DonorAccountId, notificationTitle,
                notificationContent);
        }
        
        return equipmentToUpdate;
    }

    public void RemoveEquipment(Guid equipmentId)
    {
        var equipmentToRemove = _equipmentRepository.GetById(equipmentId);

        if (equipmentToRemove == null)
        {
            throw new NotFoundException("Equipment not found");
        }

        equipmentToRemove.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        equipmentToRemove.Status = EquipmentStatusEnum.Canceled;
        equipmentToRemove.Removed = true;

        _equipmentRepository.Update(equipmentToRemove);
    }

    public List<Equipment> Query(EquipmentQueryDto query)
    {
        var equipments = _equipmentRepository.Query(query);

        return equipments;
    }

    private async void SendEquipmentAddedEmail(Equipment equipment)
    {
        try
        {
            var account = _accountService.GetById(equipment.DonorAccountId);
            var user = _userLoginService.GetById(account.UserId);

            var payload = new EmailPayload()
            {
                To = user.Email,
                Subject = "Seu anúncio foi criado com sucesso",
                Body =
                    "Seu anúncio foi criado com sucesso. Abaixo, algumas informações sobre seu equipamento: <br/><br/>" +
                    "Descrição: " + equipment.Description + "<br/>" +
                    "Tipo: " + equipment.Type + "<br/>" +
                    "Status: " + equipment.Status + "<br/>"
            };

            await _emailService.SendEmail(payload);
        }
        catch (Exception exception)
        {
            _logger.Log(LogLevel.Error, "Error sending email" + exception.Message);
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
}