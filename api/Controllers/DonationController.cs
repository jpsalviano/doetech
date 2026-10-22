using DoeTech.DTOs;
using DoeTech.Exceptions;
using DoeTech.Models;
using DoeTech.Repositories;
using DoeTech.Security;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

// Uma doação liga um receptor (quem pede) aos doadores dos equipamentos pedidos.
// O receptor cria e pode cancelar o próprio pedido; os doadores aprovam,
// recusam e acompanham; o admin pode tudo. Ninguém mais vê a doação.
[Route("api/v{version:apiVersion}/doetech/donation")]
[ApiVersion("1")] // Define a versão da API
[Authorize]
public class DonationController(DonationService donationService, DonationRepository donationRepository, Caller caller)
    : ControllerBase
{
    [HttpPost]
    public IActionResult Add([FromBody] DonationDto request)
    {
        if (request == null) return BadRequest("The request body could not be null");

        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (!caller.IsAdmin)
        {
            var account = caller.RequireAccount();
            if (account.Role != AccountRoleEnum.Receptor)
                throw new ForbiddenException("Só contas de receptor pedem doações.");
            request.RecipientAccountId = account.Id;
        }

        var donation = donationService.Add(request);

        return Ok(donation);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public IActionResult GetAll()
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var donations = donationService.GetAllDonations();

        return Ok(donations);
    }

    [HttpGet("{donationId}")]
    public IActionResult GetDonationById(Guid donationId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var donation = donationService.GetDonationById(donationId);
        RequireParticipant(donation);

        return Ok(donation);
    }

    // Troca os equipamentos de um pedido; o status muda pela rota /status.
    [HttpPut("{donationId}")]
    public IActionResult Update(Guid donationId, [FromBody] DonationUpdateDto donationDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var donation = donationService.GetDonationById(donationId);
        if (!caller.IsAdmin)
        {
            if (!caller.OwnsAccount(donation.RecipientAccountId)) throw new ForbiddenException();
            donationDto.Status = donation.Status;
        }

        var updatedDonation = donationService.UpdateDonation(donationId, donationDto);

        return Ok(updatedDonation);
    }

    [HttpPut("{donationId}/status")]
    public IActionResult UpdateStatus(Guid donationId, [FromBody] DonationStatusEnum status)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var donation = donationService.GetDonationById(donationId);
        if (!caller.IsAdmin && !IsDonorOf(donation))
        {
            // O receptor só desiste do próprio pedido.
            if (!(caller.OwnsAccount(donation.RecipientAccountId) && status == DonationStatusEnum.Canceled))
                throw new ForbiddenException();
        }

        donationService.UpdateStatus(donationId, status);

        return Ok();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{donationId}")]
    public IActionResult Delete(Guid donationId)
    {
        donationService.RemoveDonationById(donationId);

        return Ok();
    }

    // Fora o admin, cada um consulta só as próprias doações: o receptor as que
    // pediu, o doador as que envolvem os equipamentos dele.
    [HttpGet("query")]
    public IActionResult Query([FromQuery] DonationQueryDto filter)
    {
        if (!caller.IsAdmin)
        {
            var account = caller.RequireAccount();
            if (account.Role == AccountRoleEnum.Receptor)
            {
                filter.RecipientAccountId = account.Id;
                filter.DonorAccountId = null;
            }
            else
            {
                filter.DonorAccountId = account.Id;
                filter.RecipientAccountId = null;
            }
        }

        var results = donationService.Query(filter);

        return Ok(results);
    }

    private bool IsDonorOf(Donation donation) =>
        caller.AccountId != Guid.Empty && donationRepository.GetDonorAccountIds(donation.Id).Contains(caller.AccountId);

    private void RequireParticipant(Donation donation)
    {
        if (caller.IsAdmin || caller.OwnsAccount(donation.RecipientAccountId) || IsDonorOf(donation)) return;
        throw new ForbiddenException();
    }
}
