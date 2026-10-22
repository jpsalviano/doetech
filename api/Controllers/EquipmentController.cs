using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/equipment")]
[ApiVersion("1")] // Define a versão da API
[Authorize]
public class EquipmentController(EquipmentService equipmentService, Caller caller) : ControllerBase
{
    // Quem cadastra é sempre o doador logado (o admin pode cadastrar em nome de
    // outra conta); o equipamento nasce disponível.
    [HttpPost]
    public IActionResult Add([FromBody] Equipment request)
    {
        if (request == null)
        {
            return BadRequest("The request body could not be null.");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (!caller.IsAdmin)
        {
            var account = caller.RequireAccount();
            if (account.Role != AccountRoleEnum.Donor)
                throw new ForbiddenException("Só contas de doador cadastram equipamentos.");
            request.DonorAccountId = account.Id;
        }

        request.Status = EquipmentStatusEnum.Available;
        request.Removed = false;
        var equipment = equipmentService.AddEquipment(request);

        return Ok(equipment);
    }

    [HttpGet("{equipmentId}")]
    public IActionResult GetEquipmentById(Guid equipmentId)
    {
        var equipment = equipmentService.GetEquipmentById(equipmentId);

        return Ok(equipment);
    }

    [HttpGet]
    public IActionResult GetEquipments()
    {
        var equipments = equipmentService.GetEquipments();

        return Ok(equipments);
    }

    [HttpGet("query")]
    public IActionResult Query([FromQuery] EquipmentQueryDto query)
    {
        var equipments = equipmentService.Query(query);

        return Ok(equipments);
    }

    [HttpPut("{equipmentId}/status")]
    public IActionResult UpdateEquipmentAvailability(Guid equipmentId, [FromBody] EquipmentStatusDTO status)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var current = equipmentService.GetEquipmentById(equipmentId);
        caller.RequireAccountOrAdmin(current.DonorAccountId);

        var equipment = equipmentService.UpdateEquipmentStatus(equipmentId, status.Status);

        return Ok(equipment);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete]
    public IActionResult Remove(Guid equipmentId)
    {
        equipmentService.RemoveEquipment(equipmentId);

        return NoContent();
    }
}
