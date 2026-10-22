using DoeTech.Models;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/chat")]
[ApiVersion("1")] // Define a versão da API
// Nenhuma tela usa o chat ainda; até usar, fica restrito ao admin.
[Authorize(Roles = "Admin")]
public class ChatController(ChatService chatService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public IActionResult Add([FromBody] Chat request)
    {
        if (request == null)
        {
            BadRequest("The request body could not be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }


        var chat = chatService.Add(request);
        
        return Ok(chat);
    }

    [Authorize]
    [HttpGet("{chatId}")]
    public IActionResult GetChatById(Guid chatId)
    {
        var chat = chatService.GetById(chatId);

        return Ok(chat);
    }
    
    [Authorize]
    [HttpGet("{chatId}/aggregate")]
    public IActionResult GetChatAggregatingById(Guid chatId)
    {
        var chat = chatService.GetByIdAggregatingMessages(chatId);

        return Ok(chat);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete]
    public IActionResult Remove(Guid chatId)
    {

        chatService.RemoveChat(chatId);

        return NoContent();
    }

    [Authorize]
    [HttpGet("{accountId}/all")]
    public IActionResult GetAllChatAccount(Guid accountId)
    {
        
        var chats = chatService.GetAllChatsByAccount(accountId);
        
        return Ok(chats);
    }
}