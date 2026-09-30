# 11 - Production Deployment & Operations Guide

## 1. Local Development Initialization

### 1.1 LocalDB Database Attachment
1. Launch Windows PowerShell as Administrator.
2. Ensure the instance is started:
   ```powershell
   sqllocaldb start MSSQLLocalDB
   ```
3. Execute the attachment script:
   ```powershell
   sqlcmd -S "(LocalDB)\MSSQLLocalDB" -i "infra/database/attach-database.sql"
   ```

### 1.2 Starting Server & Client
* **Server (ASP.NET Core 8)**:
  ```powershell
  cd src/server
  dotnet restore
  dotnet run
  # API active on https://localhost:5001 / http://localhost:5000
  ```
* **Client (React 18 + Vite)**:
  ```powershell
  cd src/client
  npm install
  npm run dev
  # Web Portal active on http://localhost:5173
  ```

---

## 2. Multi-Container Docker Compose Deployment

The infrastructure includes complete containerization for one-command enterprise deployment:

```bash
docker-compose -f infra/docker-compose.yml up --build -d
```

### Container Topology & Port Allocations
* `hotel-client` (Nginx + React SPA): Exposed on `http://localhost:3000`
* `hotel-server` (ASP.NET Core 8 API): Exposed on `http://localhost:5000`
* `hotel-db` (Microsoft SQL Server Linux 2022): Internal Port `1433`

---

## 3. Environment Variables & Secret Configuration

### Client Environment (`src/client/.env`)
```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_TITLE="Grand Horizon Palace"
VITE_ENABLE_MOCK_STORAGE=false
```

### Server Configuration (`src/server/appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=hotel-db,1433;Database=frontend_reservation;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "Secret": "SuperSecretKeyForHotelManagementSystemJwtSigningEnterpriseGrade2026!",
    "Issuer": "GrandHorizonPalace",
    "Audience": "GrandHorizonClients",
    "ExpiryMinutes": 15
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

---

## 4. Database Backup & Disaster Recovery Procedures

### Automated Backup Script (`/infra/database/backup-database.sql`)
```sql
BACKUP DATABASE [frontend_reservation]
TO DISK = N'/var/opt/mssql/backups/frontend_reservation_latest.bak'
WITH NOFORMAT, INIT,
NAME = N'Full Hotel Reservation Database Backup',
SKIP, NOREWIND, NOUNLOAD, STATS = 10;
GO
```

### Restoration Procedure
```sql
USE master;
ALTER DATABASE [frontend_reservation] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
RESTORE DATABASE [frontend_reservation]
FROM DISK = N'/var/opt/mssql/backups/frontend_reservation_latest.bak'
WITH REPLACE;
ALTER DATABASE [frontend_reservation] SET MULTI_USER;
GO
```

---

## 5. Rollback & Zero-Downtime Migration Plan

1. **Semantic Image Tagging**: Every build artifact is tagged with standard semver (`hotel-client:v1.0.0`, `hotel-server:v1.0.0`).
2. **Blue/Green Deployment**: The upstream Nginx router points to the active upstream pool. New versions spin up alongside prior versions before swapping upstream routes.
3. **Database Reversibility**: All Entity Framework / SQL migrations include down-migration scripts (`migration.Down()`) to safely roll back schema modifications if required.
