using DoeTech.Models;
using Newtonsoft.Json;

namespace DoeTech.DTOs;

// O que outra pessoa vê de uma conta. As telas mostram nome, empresa, cidade e
// estado nas listagens; endereço e telefone só aparecem para quem tem uma
// doação em comum (para combinar a entrega). CPF, CNPJ e nascimento ficam com
// o dono e o admin.
public class AccountView
{
    [JsonProperty("id")]
    public Guid Id { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("businessName")]
    public string BusinessName { get; set; }

    [JsonProperty("role")]
    public AccountRoleEnum? Role { get; set; }

    [JsonProperty("address")]
    public AccountAddress Address { get; set; }

    [JsonProperty("phone")]
    public AccountPhone Phone { get; set; }

    public static AccountView Public(Account account) => new()
    {
        Id = account.Id,
        Name = account.Name,
        BusinessName = account.BusinessName,
        Role = account.Role,
        Address = account.Address == null ? null : new AccountAddress
        {
            City = account.Address.City,
            State = account.Address.State
        }
    };

    public static AccountView Contact(Account account)
    {
        var view = Public(account);
        view.Address = account.Address;
        view.Phone = account.Phone;
        return view;
    }
}
