using DoeTech.Models;

namespace DoeTech.DTOs;

public static class EquipmentStatusEnumExtensions
{
    public static string ToName(this EquipmentStatusEnum status)
    {
        return status switch
        {
            EquipmentStatusEnum.Available => "disponível para doação",
            EquipmentStatusEnum.InProgress => "disponibilizado para doação",
            EquipmentStatusEnum.Canceled => "em uma doação cancelada",
            EquipmentStatusEnum.Finished => "finslizado (em doação finalizada)",
            EquipmentStatusEnum.OnGoing => "enviado",
            _ => "desconhecido"
        };
    }
}