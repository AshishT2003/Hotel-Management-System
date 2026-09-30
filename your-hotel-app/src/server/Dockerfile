# Stage 1: Build the ASP.NET Core 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["your-hotel-app.csproj", "./"]
RUN dotnet restore "./your-hotel-app.csproj"

COPY . .
RUN dotnet publish "your-hotel-app.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: ASP.NET Core 8 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000
ENTRYPOINT ["dotnet", "your-hotel-app.dll"]
