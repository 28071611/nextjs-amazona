# Project Workflow

This document outlines the standard workflow for the `nextjs-amazona` project.

## 1. Development Environment
- **Command**: `npm run dev`
- **Description**: Starts the Next.js development server with Turbopack.
- **URL**: `http://localhost:3000`

## 2. Database Management
- **Verification**: `npm run verify-db`
- **Description**: Verifies the connection to MongoDB and checks if core collections (Users, Products, Settings) exist.
- **Seeding**: `npm run seed`
- **Description**: Seeds the database with initial data (Users, Products, etc.). WARNING: This might clear existing data depending on the implementation.

## 3. Project Verification
- **Command**: `npm run verify-project`
- **Description**: Runs a comprehensive check on the project structure, environment variables, and essential files.

## 4. Internationalization (i18n)
- **Structure**: All localized files reside under `app/[locale]/`.
- **Configuration**: Managed in `i18n/routing.ts` and `i18n/request.ts`.
- **Messages**: Located in `messages/*.json`.

## 5. Build and Deployment
- **Linting**: `npm run lint`
- **Type Checking**: `npx tsc --noEmit`
- **Build**: `npm run build`
- **Start Production**: `npm run start`

## 6. Common Fixes
- **Hydration Errors**: Use `npm run fix-hydration-win` (on Windows) or `npm run fix-hydration` (on Linux/Mac) to resolve common hydration issues.
