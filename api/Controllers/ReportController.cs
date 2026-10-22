using DoeTech.DTOs;
using DoeTech.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DoeTech.Controllers;

[Route("api/v{version:apiVersion}/doetech/report")]
[ApiVersion("1")] // Define a versão da API
// Alimenta os dashboards, que só o admin vê.
[Authorize(Roles = "Admin")]
public class ReportController(ReportService reportService) : ControllerBase
{
    
    [HttpGet("equipments")]
    public IActionResult EquipmentsReport([FromQuery] EquipmentReportDto reportFilters)
    {
        var equipments = reportService.GetEquipmentsReport(reportFilters);

        return Ok(equipments);
    }
    
    [HttpGet("donations")]
    public IActionResult DonationsReport([FromQuery] DonationReportDto reportFilters)
    {
        var donations = reportService.GetDonationsReport(reportFilters);

        return Ok(donations);
    }
    
    [HttpGet("accounts")]
    public IActionResult AccountsReport([FromQuery] AccountReportDto reportFilters)
    {
        var donations = reportService.GetAccountsReport(reportFilters);

        return Ok(donations);
    }
}