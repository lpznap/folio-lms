using Library.Exceptions;

namespace Library.Middleware;
public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            var status = exception switch
            {
                DomainException domain => domain.Status,
                BadHttpRequestException => 400,
                _ => 500
            };
            if (status == 500)
                logger.LogError(exception, "Unhandled request failure {TraceId}", context.TraceIdentifier);
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new { title = status == 500 ? "An unexpected error occurred." : exception.Message, status, traceId = context.TraceIdentifier });
        }
    }
}
