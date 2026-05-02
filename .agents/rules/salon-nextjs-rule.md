---
trigger: always_on
---

# Project Context
- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (radix-nova style)
- **Package Manager**: pnpm

# Coding Standards & Guidelines
- **TypeScript**: Always use strict typing. Avoid using `any`.
- **Next.js**: 
  - Prefer React Server Components (RSC) by default.
  - Use `'use client'` only when interactivity is required (e.g., `useState`, event listeners).
  - Utilize Next.js built-in components (`next/image`, `next/link`).
- **Styling**: 
  - Use Tailwind CSS utility classes.
  - Always use the `cn()` utility from `lib/utils` (combining `clsx` and `tailwind-merge`) when applying conditional classes or overriding component styles.
- **Formatting**:
  - Always use single quotes (`'`) instead of double quotes (`"`).
  - Code must be formatted using Prettier before committing (`pnpm format`).
  - Follow ESLint rules (`pnpm lint`).
- **Component Architecture**:
  - Shared/UI components belong in `components/ui` (managed by shadcn).
  - Feature-specific components belong in `components/`.
  - Keep components modular and reusable.
