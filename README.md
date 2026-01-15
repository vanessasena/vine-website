# Vine Church KWC Website

A modern, bilingual church website built with Next.js for Vine Church in Kitchener, Ontario, Canada.

## Features

- **Bilingual Support**: Portuguese (default) and English
- **Modern Design**: Based on reference sites from Videira Philadelphia and Seattle
- **Responsive Layout**: Mobile-first design that works on all devices
- **Internationalization**: Using next-intl for seamless language switching
- **Church Information**: Complete information about Vine Church KWC

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional for database integration):
   ```bash
   cp .env.example .env.local
   ```
   See `SUPABASE_SETUP.md` for database configuration details.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The sermons feature uses Supabase (PostgreSQL) for data storage. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

**Note**: The application includes a fallback mechanism, so it will work with static data even without database configuration.

## Production Backup

Create a full backup of the production Supabase database using Dockerized `pg_dump`.

- Prerequisites: Docker Desktop installed and running
- Credentials: Supabase Dashboard → Settings → Database → use the DB password

Commands (Windows PowerShell):

```powershell
# 1) Set your Supabase connection details for this session
$env:SUPABASE_DB_HOST="your-pooler-host.supabase.com"
$env:SUPABASE_DB_PORT="6543"
$env:SUPABASE_DB_USER="postgres.your-project-ref"
$env:SUPABASE_DB_PASSWORD="YOUR_SUPABASE_DB_PASSWORD"

# 2) Run the backup script (writes backups/vine-prod-backup.sql)
npm run backup:prod
```

**Connection details:**
- Get host, port, and user from: Supabase Dashboard → Settings → Database → Connection string
- Typically uses session pooling (port 6543) with user format `postgres.<project-ref>`
- Format: plain SQL (includes schema + data via COPY blocks)
- Excludes: ownership and privileges (`--no-owner --no-privileges`) for easier restore

Restore (example using Docker Postgres locally):

```powershell
# Run psql inside Postgres 17 container to restore the plain SQL dump
docker run --rm -v "$PWD\\backups:/backup" postgres:17 psql \
  -h your-local-host -p 5432 -U postgres -d postgres -f /backup/vine-prod-backup.sql
```

Notes:
- The dump contains data in `COPY ... FROM stdin;` sections; this is normal for plain-format dumps.
- To create schema-only or data-only variants, append `-s` or `-a` to the `pg_dump` options. If you want dedicated npm scripts for those, we can add them.

### Automated Weekly Backups

Set up automatic backups every Tuesday at 11:00 AM using Windows Task Scheduler:

1. **Configure credentials** - Edit `backup-scheduled.ps1` and update the Supabase connection details:
   ```powershell
   $env:SUPABASE_DB_HOST = "your-pooler-host.supabase.com"
   $env:SUPABASE_DB_PORT = "6543"
   $env:SUPABASE_DB_USER = "postgres.your-project-ref"
   $env:SUPABASE_DB_PASSWORD = "YOUR_ACTUAL_PASSWORD"
   ```

2. **Create the scheduled task** - Run as Administrator:
   ```powershell
   .\setup-backup-task.ps1
   ```

3. **Test the task** (optional):
   ```powershell
   Start-ScheduledTask -TaskName "Vine Website Database Backup"
   ```

Backup logs are saved to `backups/backup-log.txt`.

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Locale-specific layout
│   │   └── page.tsx       # Home page
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── Navigation.tsx     # Main navigation component
│   └── Hero.tsx          # Hero section component
├── i18n.ts               # Internationalization configuration
├── middleware.ts         # Locale detection middleware
└── messages/
    ├── pt.json           # Portuguese translations
    └── en.json           # English translations
```

## Content

The website includes:

- **Quem Somos** (About Us): Church history and vision
- **Agenda** (Schedule): Service times and events
- **Vine Kids**: Children's ministry information
- **Galeria** (Gallery): Photo gallery
- **Palavras** (Words): Sermons and messages
- **Células** (Cell Groups): Small group information

## Church Information

- **Location**: Kitchener, Ontario, Canada
- **Address**: 417 King St W, Kitchener, ON N2G 1C2
- **Service Time**: Sunday at 10 AM
- **Pastor**: Pr Boris Carvalho

## Deployment

This project is ready to be deployed to Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy with zero configuration

## Contributing

This website represents Vine Church KWC, part of the international Vine Church network that originated in Brazil.

## License

© 2026 Vine Church KWC. All rights reserved.