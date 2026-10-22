using DoeTech.DTOs;
using DoeTech.Models;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

// As notificações nascem dos serviços (doação criada, status mudou...). Pela
// API, cada conta lê e marca como lidas só as suas; criar e editar fica com o
// admin.
[Route("api/v{version:apiVersion}/doetech/notification")]
[ApiVersion("1")]
[Authorize]
public class NotificationController(NotificationService notificationService, Caller caller) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public IActionResult Add([FromBody] Notification request)
    {
        if (request == null)
        {
            return BadRequest("The request body could not be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var notification = notificationService.Add(request);

        return Ok(notification);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{notificationId}")]
    public IActionResult Update(Guid notificationId, [FromBody] Notification request)
    {
        if (request == null)
        {
            return BadRequest("The request body could not be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updatedNotification = notificationService.Update(notificationId, request);

        return Ok(updatedNotification);
    }

    [HttpPost("{notificationId}")]
    public IActionResult MarkAsReadById(Guid notificationId)
    {
        caller.RequireAccountOrAdmin(notificationService.GetById(notificationId).AccountId);

        notificationService.MarkAsRead(notificationId);

        return Ok();
    }

    [HttpGet("{notificationId}")]
    public IActionResult GetById(Guid notificationId)
    {
        var notification = notificationService.GetById(notificationId);
        caller.RequireAccountOrAdmin(notification.AccountId);

        return Ok(notification);
    }

    [HttpGet("{accountId}/all")]
    public IActionResult GetAllByAccountId(Guid accountId)
    {
        caller.RequireAccountOrAdmin(accountId);

        var notifications = notificationService.GetAllByAccountId(accountId);

        return Ok(notifications);
    }

    [HttpGet("query")]
    public IActionResult Query([FromQuery] NotificationDTO filters)
    {
        if (!caller.IsAdmin)
        {
            filters.AccountId = caller.RequireAccount().Id;
        }

        var notifications = notificationService.Query(filters);

        return Ok(notifications);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete]
    public IActionResult Remove(Guid notificationId)
    {
        notificationService.RemoveMessage(notificationId);

        return NoContent();
    }
}
