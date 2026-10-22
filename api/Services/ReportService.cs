using DoeTech.DTOs;
using DoeTech.Models;
using DoeTech.Repositories;

namespace DoeTech.Services;

public class ReportService : IService
{
    private readonly EquipmentRepository _equipmentRepository;
    private readonly DonationRepository _donationRepository;
    private readonly AccountRepository _accountRepository;

    public ReportService(EquipmentRepository equipmentRepository, DonationRepository donationRepository,  AccountRepository accountRepository)
    {
        _equipmentRepository = equipmentRepository;
        _donationRepository = donationRepository;
        _accountRepository = accountRepository;
    }

    public List<Equipment> GetEquipmentsReport(EquipmentReportDto filters)
    {
        return _equipmentRepository.QueryReport(filters);
    }

    public List<Donation> GetDonationsReport(DonationReportDto filters)
    {
        return _donationRepository.QueryReport(filters);
    }

    public List<Account> GetAccountsReport(AccountReportDto filters)
    {
        return _accountRepository.QueryReport(filters);
    }


}