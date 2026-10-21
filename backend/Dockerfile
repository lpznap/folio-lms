FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
# RUN dotnet publish Library.Api.csproj -c Release -o /app
RUN dotnet publish Library.Api.csproj -c Debug -o /app
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet","Library.Api.dll"]
