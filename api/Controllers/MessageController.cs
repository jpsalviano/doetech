using DoeTech.Models;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/message")]
[ApiVersion("1")] // Define a versão da API
// Nenhuma tela usa as mensagens ainda; até usar, ficam restritas ao admin.
[Authorize(Roles = "Admin")]
public class MessageController(MessageService messageService) : ControllerBase
{
    [Authorize]
    [HttpPost]
    public IActionResult Add([FromBody] Message request)
    {
        if (request == null)
        {
            BadRequest("The request body could not be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }


        var chat = messageService.Add(request);

        return Ok(chat);
    }

    [Authorize]
    [HttpGet("{messageId}")]
    public IActionResult GetById(Guid messageId)
    {
        var chat = messageService.GetById(messageId);

        return Ok(chat);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete]
    public IActionResult Remove(Guid messageId)
    {

        messageService.RemoveMessage(messageId);

        return NoContent();
    }
}