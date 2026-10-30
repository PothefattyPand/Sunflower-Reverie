# Sunflower Reverie 🌻

A classical literary publishing website inspired by sunflowers, warm sunshine, and positivity. Designed for an author to freely publish blogs, poetry, journals, essays, and creative writings.

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Typography:** Playfair Display (Serif) & Inter (Sans) via `next/font`
- **Animation:** Motion for React (`motion`)
- **Icons:** Lucide React (`lucide-react`)
- **CMS:** Sanity CMS (configured in upcoming milestone)
- **Hosting:** Netlify Free Tier (configured in upcoming milestone)

## Project Structure

```text
src/
├── app/                  # Next.js App Router routes & layouts
│   ├── about/            # About page
│   ├── essays/           # Essays section
│   ├── journals/         # Journals section
│   ├── poetry/           # Poetry section
│   ├── writings/         # Creative writings & blogs
│   ├── globals.css       # Tailwind CSS & theme definitions
│   ├── layout.tsx        # Root layout with fonts & shell
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components
│   ├── common/           # Generic UI building blocks (Container, etc.)
│   └── layout/           # Global shell components (Navbar, Footer)
├── lib/                  # Utilities and helper functions
└── types/                # Shared TypeScript interfaces & types
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
npm run start
```
