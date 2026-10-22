using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Services;

public class ChatService : IService
{
    private readonly ChatRepository _chatRepository;
    private readonly AccountService _accountService;
    private readonly UserLoginService _userLoginService;
    private readonly EmailService _emailService;
    private readonly ILogger<ExceptionHandler> _logger;

    public ChatService(
        ChatRepository chatRepository,
        AccountService accountService,
        UserLoginService userLoginService,
        EmailService emailService,
        ILogger<ExceptionHandler> logger)
    {
        _chatRepository = chatRepository;
        _accountService = accountService;
        _userLoginService = userLoginService;
        _emailService = emailService;
        _logger = logger;
    }

    public Chat Add(Chat chat)
    {
        ValidateContractRules(chat);

        chat.Id = Guid.NewGuid();

        _chatRepository.Add(chat);
        
        SendChatCreatedEmail(chat.ReceiverAccountId);
        
        return chat;
    }
    
    public Chat GetById(Guid chatId)
    {
        var chat = _chatRepository.GetById(chatId);
        
        if (chat == null)
        {
            throw new NotFoundException("Chat not found by id: " + chatId);
        }

        return chat;
    }
    
    public Chat GetByIdAggregatingMessages(Guid chatId)
    {
        var chat = _chatRepository.GetByIdAggregatingMessages(chatId);
        
        if (chat == null)
        {
            throw new NotFoundException("Chat not found by id: " + chatId);
        }

        return chat;
    }

    public void RemoveChat(Guid chatId)
    {
        _chatRepository.RemoveById(chatId);
    }

    public List<Chat> GetAllChatsByAccount(Guid accountId)
    {
        return _chatRepository.GetChatsByAccountId(accountId);
    }
    
    private void ValidateAccount(Guid accountId)
    {
        // Se a conta não for encontrada, vai estourar um NFE
        _accountService.GetById(accountId);
    }

    private void ValidateContractRules(Chat chat)
    {
        if (chat == null)
        {
            throw new ValidationException("chat cannot be null");
        }

        if (chat.SenderAccountId == null || chat.ReceiverAccountId == null)
        {
            throw new ValidationException("chat sender or receiver accounts cannot be null");
        }

        ValidateAccount(chat.SenderAccountId);
        ValidateAccount(chat.ReceiverAccountId);
    }

    private async void SendChatCreatedEmail(Guid accountId)
    {
        try
        {
            var account = _accountService.GetById(accountId);
            var user = _userLoginService.GetById(account.UserId);

            var payload = new EmailPayload()
            {
                To = user.Email,
                Subject = "Novo chat criado",
                Body = "Você tem um novo chat. <br/>" +
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