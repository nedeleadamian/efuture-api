# Efuture Interview API
 
NestJS + TypeORM backend for a simple “short messages” platform.

## Prerequisites

- **Node.js** v24 or higher
- **PostgreSQL** (for non-Docker setup)

## Quick Start

### With Docker (Recommended)

```bash
docker compose up --build
```

This starts:
- Postgres (`postgres:18-alpine`)
- API (NestJS)

The database will be automatically initialized with migrations and populated with initial data.

 ### Without Docker

 1. **Install dependencies**
 ```bash
 npm install
 ```

 2. **Set up environment**
 ```bash
 cp .env.sample .env
 # Edit .env with your database configuration
 ```

 3. **Run database migrations**
 ```bash
 npm run migration:run
 ```
 This will initialize the database schema and populate it with initial data.

 4. **Start the application**
 ```bash
 npm run start:dev
 ```

 Make sure Postgres is available and matches your `.env` configuration.

 ## Default Login

 After starting the application, you can login with:

 - **Email**: admin@admin.com
 - **Password**: password

 ## API Documentation

 Swagger is available at `http://localhost:3001/api/docs` (only in non-production environment).

 ## Health Check

 Check if the application is running:
 ```bash
 curl http://localhost:3001/api/v1
 ```

 
