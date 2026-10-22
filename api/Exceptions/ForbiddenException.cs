namespace DoeTech.Exceptions;

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "Você não tem permissão para acessar este recurso.") : base(message)
    {
    }
}
