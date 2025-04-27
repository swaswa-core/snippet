# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint Commands
- `npm run dev` - Start development server with turbopack
- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run Next.js linting

## Code Style Guidelines
- **TypeScript**: Use strict typing. Define types in dedicated files where appropriate.
- **Imports**: Use path aliases with @/ prefix. Group imports by type (React/Next first).
- **Components**: Use 'use client' directive for client components. Define props with interfaces.
- **Formatting**: 4-space indentation, semicolons required, JSX attributes on new lines.
- **Naming**: PascalCase for components/types, camelCase for variables/functions, kebab-case for CSS.
- **Error Handling**: Use try/catch with structured error responses in API routes.

## File Organization
- UI components in `/components/ui/`
- Page components in `/app/**/page.tsx`
- Layout components in `/components/layout/`
- API routes in `/app/api/`
- Types in `/types/`