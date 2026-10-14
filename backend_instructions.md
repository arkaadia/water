# Gowarano Phase 1 Deliverables

## 1. Summary of Actual Architecture
- **Frontend/Existing App**: The project uses Vite + React with TypeScript, served by an Express server (`server.ts`) that also handles SMS integration. The frontend is built into `dist/` for production.
- **Backend (Phase 1)**: We have introduced a NestJS backend (`backend/` directory) with a distinct `/api/v1` namespace. This runs logically separated from the `server.ts` Express server.
- **Database**: PostgreSQL (v15) with Prisma ORM.

## 2. List of Created and Modified Files
- Modified:
  - `.env` and `.env.example` (Added `DATABASE_URL` and `BACKEND_PORT`)
- Created:
  - `docker-compose.yml`
  - `prisma/schema.prisma`
  - `backend/src/main.ts`
  - `backend/src/app.module.ts`
  - `backend/src/prisma.service.ts`
  - `backend/src/health.controller.ts`
  - `backend/src/all-exceptions.filter.ts`
  - `backend/tsconfig.json`
  - `backend/package.json`
  - `backend_instructions.md`

## 3. Database Schema and Entity Relationships
- **User**: ID, Username, DisplayName, PasswordHash, Status, CreatedAt, UpdatedAt, LastLogin. Has many-to-many relationship with `Group`.
- **Group**: ID, Name, Description, Status, CreatedAt, UpdatedAt. Has many-to-many relationship with `User` and `Permission`.
- **Permission**: ID, Code, Description. Has many-to-many relationship with `Group`.

## 4. Migration Names and Execution Status
- `20261014084558_init`: Applied successfully against the local PostgreSQL database instance.

## 5. Required Environment Variables
- `DATABASE_URL`="postgresql://gowarano_user:gowarano_password@localhost:5432/gowarano_db?schema=public"
- `BACKEND_PORT`=3001 (default)

## 6. Exact Commands to Start Backend and Database Locally
- Start Database: Since Docker may face overlay permission issues, run PostgreSQL locally, or configure `docker-compose.yml` to not use named volumes if required. Otherwise, `sudo service postgresql start`.
- Start Backend: `cd backend && npm run start`

## 7. Instructions for Deployment on Linux VPS
1. Ensure PostgreSQL is installed or run the `docker-compose.yml` using `docker compose up -d`
2. Run Prisma migrations: `npx prisma migrate deploy`
3. Build the backend: `cd backend && npm run build`
4. Start the backend with PM2 or a similar process manager: `pm2 start dist/main.js --name "gowarano-backend"`

## 8. Backup and Restore Procedure
**Backup:**
Run the following command to backup your database:
`pg_dump -U gowarano_user -F c -b -v -f /path/to/backup/gowarano_db.backup gowarano_db`
(It is recommended to run this via a scheduled cron job).

**Restore:**
To restore from a backup:
`pg_restore -U gowarano_user -d gowarano_db -v /path/to/backup/gowarano_db.backup`

## 9. Test Results
- Backend Build: Passed.
- TypeScript Checks: Passed for backend.
- Prisma Schema Validation: Passed.
- Migration Verification: Passed.
- Database Connectivity Test: Passed.
- Health Endpoint Test: Passed (Returns `{"status":"ok","database":"connected"}`).
- Existing Frontend Server check: Validated `server.ts` structure remains intact.

## 9. Remaining Manual Configuration
- You need to manage environment variable injections on the VPS securely.
- Ensure ports `3000` (for Express frontend) and `3001` (for NestJS backend) are properly routed if you wish to use them concurrently through Nginx.