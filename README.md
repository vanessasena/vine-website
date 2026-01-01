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

© 2025 Vine Church KWC. All rights reserved.