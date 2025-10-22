
# Ar-Rahnu Islamic Pawn Broking System

A modern, enterprise-grade web application for managing Islamic pawn broking operations (Ar-Rahnu) built with React, TypeScript, Express, and PostgreSQL.

## Overview

This system provides a complete solution for managing Islamic pawn broking operations, including customer management, gold valuation, loan processing, vault inventory, and financial reporting—all while adhering to Shariah-compliant practices.

## Features

### Core Modules

- **Dashboard** - Real-time metrics, loan volume trends, and maturity alerts
- **Customer Management** - Customer profiles, IC scanning, transaction history
- **Pawn Transactions** - Multi-step loan processing with gold valuation and contract generation
- **Loan Ledger** - Track active loans, payments, redemptions, and defaults
- **Vault Management** - Physical inventory tracking with barcode/RFID support
- **Gold Price Management** - Live market rates by karat with price history
- **Branch Management** - Multi-location support with centralized oversight
- **Renewal Processing** - Interest calculation and contract extensions

### Key Capabilities

- Shariah-compliant interest calculations
- Real-time gold price integration
- Multi-language support (English/Malay/Arabic)
- Role-based access control (Admin, Manager, Staff)
- Automated maturity alerts and reminders
- Digital contract generation and storage
- Comprehensive audit trails

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for server state management
- **Wouter** for routing
- **Tailwind CSS** with shadcn/ui components
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for type-safe database queries
- **Replit Authentication** for user management
- **Replit Object Storage** for file uploads

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main application component
├── server/
│   ├── db.ts               # Database connection
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Object storage utilities
│   └── index.ts            # Express server setup
├── shared/
│   └── schema.ts           # Shared database schema
└── design_guidelines.md    # UI/UX design specifications
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or compatible package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run db:push
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://0.0.0.0:5000`

### Environment Variables

The following environment variables are automatically configured in Replit:

- `DATABASE_URL` - PostgreSQL connection string
- `REPLIT_DB_URL` - Replit database URL
- `PORT` - Server port (default: 5000)

## Database Schema

### Main Tables

- **users** - System users and authentication
- **branches** - Physical branch locations
- **customers** - Customer profiles and KYC data
- **transactions** - Pawn loan records
- **payments** - Payment and redemption history
- **gold_prices** - Historical gold rates by karat
- **vault_items** - Physical inventory tracking
- **audit_logs** - System activity audit trail

See `shared/schema.ts` for complete schema definitions.

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new pawn transaction
- `PUT /api/transactions/:id/redeem` - Process redemption

### Gold Prices
- `GET /api/gold-prices` - Get current rates
- `POST /api/gold-prices` - Update price

See `server/routes.ts` for complete API documentation.

## Design System

The application follows Material Design principles with Islamic cultural customization. Key design features include:

- **Color Palette**: Deep Islamic green primary (#2d5f3f), muted gold accents
- **Typography**: Inter for UI, Poppins for headings, Amiri for Arabic elements
- **Components**: shadcn/ui component library with custom theming
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

Full design specifications are available in `design_guidelines.md`.

## Development

### Running Tests
```bash
npm run check
```

### Building for Production
```bash
npm run build
```

### Database Migrations
```bash
npm run db:push
```

## Deployment

This application is optimized for deployment on Replit with automatic scaling and PostgreSQL database integration.

### Production Build
```bash
npm run build
npm run start
```

The production server runs on port 5000, which is forwarded to ports 80 and 443.

## Security

- Authentication via Replit Auth
- Role-based access control (RBAC)
- Secure session management
- Input validation and sanitization
- Audit logging for all transactions
- Encrypted storage for sensitive documents

## Contributing

1. Follow the established code structure and naming conventions
2. Ensure all TypeScript types are properly defined
3. Test changes thoroughly before committing
4. Follow the design guidelines for UI consistency
5. Add appropriate error handling and logging

## License

MIT License - See LICENSE file for details

## Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Replit**
