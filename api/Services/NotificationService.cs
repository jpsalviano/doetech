using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Services;

public class NotificationService : IService
{
    private readonly NotificationRepository _notificationRepository;
    private readonly AccountService _accountService;
    private readonly UserLoginService _userLoginService;
    private readonly EmailService _emailService;
    private readonly ILogger<MessageService> _logger;

    private const int NotificationContentMaxLength = 250;
    private const int NotificationTitleMaxLength = 64;

    public NotificationService(NotificationRepository notificationRepository, AccountService accountService,
        UserLoginService userLoginService, EmailService emailService, ILogger<MessageService> logger)
    {
        _notificationRepository = notificationRepository;
        _accountService = accountService;
        _userLoginService = userLoginService;
        _emailService = emailService;
        _logger = logger;
    }

    public Notification Add(Notification notification)
    {
        ValidateContractRules(notification);

        ValidateAccount(notification.AccountId);
        
        notification.Id = Guid.NewGuid();

        _notificationRepository.Add(notification);

        SendNewMessageEmail(notification.AccountId);

        return notification;
    }
    
    public Notification Update(Guid notificationId, Notification notification)
    {
        ValidateContractRules(notification);
        
        var notificationToUpdate = _notificationRepository.GetById(notificationId);

        if (notificationToUpdate == null)
        {
            throw new NotFoundException("Notification not found: " + notificationId);
        }
        
        notificationToUpdate.Content = notification.Content;
        notificationToUpdate.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        _notificationRepository.Update(notificationToUpdate);

        return notificationToUpdate;
    }
    
    public void MarkAsRead(Guid notificationId)
    {
        
        var notificationToUpdate = _notificationRepository.GetById(notificationId);

        if (notificationToUpdate == null)
        {
            throw new NotFoundException("Notification not found: " + notificationId);
        }

        _notificationRepository.MarkNotificationsAsRead(notificationId);
    }

    public Notification GetById(Guid chatId)
    {
        var notification = _notificationRepository.GetById(chatId);

        if (notification == null)
        {
            throw new NotFoundException("Notification not found by id: " + chatId);
        }

        return notification;
    }
    
    public List<Notification> GetAllByAccountId(Guid accountId)
    {
        var notifications = _notificationRepository.GetAllByAccount(accountId);

        return notifications;
    }
    
    public List<Notification> Query(NotificationDTO query)
    {
        return _notificationRepository.QueryNotifications(query);
    }


    public void RemoveMessage(Guid notificationId)
    {
        _notificationRepository.RemoveById(notificationId);
    }

    private void ValidateAccount(Guid accountId)
    {
        // Se a conta não for encontrada, vai estourar um NFE
        _accountService.GetById(accountId);
    }

    private void ValidateContractRules(Notification notification)
    {
        if (notification == null)
        {
            throw new ValidationException("notification cannot be null");
        }

        if (notification.Content == null)
        {
            throw new ValidationException("message content cannot be null");
        }

        if (notification.Content.Length > NotificationContentMaxLength)
        {
            throw new ValidationException("notification content cannot exceed " + NotificationContentMaxLength + " characters");
        }
        
        if (notification.Title == null)
        {
            throw new ValidationException("message title cannot be null");
        }

        if (notification.Title.Length > NotificationTitleMaxLength)
        {
            throw new ValidationException("notification content cannot exceed " + NotificationTitleMaxLength + " characters");
        }
    }

    private async void SendNewMessageEmail(Guid accountId)
    {
        try
        {
            var account = _accountService.GetById(accountId);
            var user = _userLoginService.GetById(account.UserId);
            
            var payload = new EmailPayload()
            {
                To = user.Email,
                Subject = account.Name + ", você tem uma nova notificação te esperando!",
                Body = "Você tem uma notificação te esperando no DoeTech.<br/>" +
                       "Acesse o DoeTech para saber mais.<br/>"
            };

            await _emailService.SendEmail(payload);
        }
        catch (Exception exception)
        {
            _logger.Log(LogLevel.Error, "Error sending email" + exception.Message);
        }
    }
}