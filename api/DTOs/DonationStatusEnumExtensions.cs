using DoeTech.Models;

namespace DoeTech.DTOs;

public static class DonationStatusEnumExtensions
{
    public static string ToName(this DonationStatusEnum status)
    {
        return status switch
        {
            DonationStatusEnum.Approved => "aprovada",
            DonationStatusEnum.InProgress => "em andamento",
            DonationStatusEnum.Canceled => "cancelada",
            DonationStatusEnum.Finished => "finalizada",
            DonationStatusEnum.Pending => "pendente",
            _ => "desconhecido"
        };
    }
}