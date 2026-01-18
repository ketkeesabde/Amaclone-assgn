# Amaclone Frontend

A React + TypeScript frontend for the Ecommerce Store application.

## Features

- **React + TypeScript**: Modern, type-safe frontend
- **Product Catalog**: Browse and add products to cart
- **Shopping Cart**: View cart items and apply discount codes
- **Checkout**: Complete order placement
- **Admin Dashboard**: View statistics and generate discount codes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` by default.

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components (Header)
│   ├── pages/           # Page components (Shop, Cart, Checkout, Admin)
│   ├── services/        # API service layer
│   ├── types/           # TypeScript type definitions
│   ├── data/            # Static data (products)
│   ├── App.tsx          # Main app component
│   ├── App.css          # Global styles
│   └── main.tsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Pages

### Shop (`/`)
- Display product catalog
- Add products to cart

### Cart (`/cart`)
- View cart items
- Apply discount codes
- Proceed to checkout

### Checkout (`/checkout`)
- Review order summary
- Place order
- View order confirmation

### Admin (`/admin`)
- View store statistics
- Generate discount codes
- View all discount codes and their status

## API Integration

The frontend communicates with the backend API through:
- `src/services/api.ts` - API service layer with `clientApi` and `adminApi` exports

The backend is expected to run on `http://localhost:3000` (configured in `vite.config.ts` proxy).

## Development

The frontend uses Vite for fast development and hot module replacement (HMR).

## Notes

- Currently uses a hardcoded `userId` of `'user1'` - in a real application, this would come from authentication
- Product data is static in `src/data/products.ts` - in production, this would come from an API
