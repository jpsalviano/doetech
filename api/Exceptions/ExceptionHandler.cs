namespace DoeTech.Exceptions;

public class ExceptionHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandler> _logger;

    public ExceptionHandler(RequestDelegate next, ILogger<ExceptionHandler> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException exception)
        {
            _logger.LogWarning(exception, "Resource not found");
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { error = exception.Message });
        }

        catch (ValidationException exception)
        {
            _logger.LogInformation(exception, "Validation error");
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = exception.Message });
        }

        catch (InvalidCredentialsException exception)
        {
            _logger.LogError(exception, "Invalid credentials");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = exception.Message });
        }
        
        catch (ForbiddenException exception)
        {
            _logger.LogWarning(exception, "Forbidden");
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = exception.Message });
        }

        catch (Exception exception) {
            // O detalhe fica só no log: a mensagem de uma exceção qualquer pode
            // trazer SQL, caminhos ou dados internos.
            _logger.LogError(exception, "Undefined error");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "Internal Server Error" });
        }
    }
}
