# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality and fix issues

## Architecture

This is a comprehensive IT Assets Inventory Management System built with Next.js 15, MongoDB, and TypeScript.

### Tech Stack
- **Next.js 15** with App Router
- **React 19** 
- **TypeScript** with strict mode enabled
- **MongoDB** with Mongoose ODM
- **Tailwind CSS v4** for styling
- **Zod** for schema validation

### Database Models
- **Catalog**: Asset categories (servers, switches, firewalls, etc.)
- **SKU**: Product models with specifications, pricing, and warranty details
- **Asset**: Individual asset instances with financial tracking and deployment details

### Key Features
- **Full CRUD operations** for Catalogs, SKUs, and Assets
- **Financial tracking** with 4-year depreciation and annual warranty OPEX
- **Search, filter, and pagination** across all entity types
- **Comprehensive reporting** with forecast, current value, depreciation schedule, and OPEX breakdown
- **Multi-datacenter support** with geographic asset distribution

### Project Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable React components organized by feature
- `src/lib/db/` - Database connection and Mongoose models
- `src/lib/utils/` - Utility functions including financial calculations
- `src/scripts/` - Database seeding and maintenance scripts

### Financial Calculations
- **Depreciation**: 4-year straight-line depreciation starting from go-live date
- **OPEX**: Annual warranty costs converted to monthly operational expenses
- **Forecasting**: Monthly projections combining depreciation and OPEX
- **Reporting**: Real-time asset valuation and comprehensive financial analysis

### Database Setup
- MongoDB running on localhost:27017 (or configure via MONGODB_URI)
- Use `/api/seed` endpoint to generate test data (5 catalogs, 8 SKUs, 100 assets)
- Comprehensive seed data includes HP, Dell, Lenovo servers, Cisco switches, and more

### Key Conventions
- Uses TypeScript path mapping with `@/*` pointing to `./src/*`
- MongoDB connection with proper connection pooling and error handling
- Strict TypeScript with comprehensive interface definitions
- Tailwind CSS with utility-first responsive design
- API error handling with centralized error management