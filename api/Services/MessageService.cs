using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using ValidationException = System.ComponentModel.DataAnnotations.ValidationException;

namespace DoeTech.Services;

public class MessageService : IService
{
    private readonly MessageRepository _messageRepository;
    private readonly ChatService _chatService;
    private readonly AccountService _accountService;
    private readonly UserLoginService _userLoginService;
    private readonly EmailService _emailService;
    private readonly ILogger<MessageService> _logger;

    private const int MessageContentMaxLength = 500;

    public MessageService(MessageRepository messageRepository, ChatService chatService, AccountService accountService,
        UserLoginService userLoginService, EmailService emailService, ILogger<MessageService> logger)
    {
        _messageRepository = messageRepository;
        _chatService = chatService;
        _accountService = accountService;
        _userLoginService = userLoginService;
        _emailService = emailService;
        _logger = logger;
    }

    public Message Add(Message message)
    {
        ValidateContractRules(message);

        var chat = _chatService.GetById(message.ChatId);

        if (chat == null)
        {
            throw new NotFoundException("Chat not found by id: " + message.ChatId);
        }

        ValidateAccount(message.AccountId);
        
        message.Id = Guid.NewGuid();

        _messageRepository.Add(message);

        SendNewMessageEmail(chat.SenderAccountId, chat.ReceiverAccountId);

        return message;
    }

    public Chat GetById(Guid chatId)
    {
        var chat = _messageRepository.GetById(chatId);

        if (chat == null)
        {
            throw new NotFoundException("Message not found by id: " + chatId);
        }

        return chat;
    }


    public void RemoveMessage(Guid chatId)
    {
        _messageRepository.RemoveById(chatId);
    }

    private void ValidateAccount(Guid accountId)
    {
        // Se a conta não for encontrada, vai estourar um NFE
        _accountService.GetById(accountId);
    }

    private void ValidateContractRules(Message message)
    {
        if (message == null)
        {
            throw new ValidationException("message cannot be null");
        }

        if (message.Content == null)
        {
            throw new ValidationException("message content cannot be null");
        }

        if (message.Content.Length > MessageContentMaxLength)
        {
            throw new ValidationException("message content cannot exceed " + MessageContentMaxLength + " characters");
        }
    }

    private async void SendNewMessageEmail(Guid senderAccountId, Guid receiverAccountId)
    {
        try
        {
            var receiverAccount = _accountService.GetById(receiverAccountId);
            var receiverUser = _userLoginService.GetById(receiverAccount.UserId);

            var senderAccount = _accountService.GetById(senderAccountId);

            var payload = new EmailPayload()
            {
                To = receiverUser.Email,
                Subject = "Você tem uma nova mensagem de " + senderAccount.Name,
                Body = "Você tem uma nova mensagem no seu chat, de " + senderAccount.Name + ". <br/>" +
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