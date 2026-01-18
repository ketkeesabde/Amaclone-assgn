# Ecommerce Store Backend API

A Node.js/Express/TypeScript backend implementation for an ecommerce store with cart management, checkout functionality, and discount code system.

## Features

- **TypeScript**: Fully typed backend with TypeScript for better code quality and maintainability
- **Client APIs**: Add items to cart, apply discount codes, and checkout
- **Admin APIs**: Generate discount codes and view store statistics
- **Discount System**: Every nth order (default: 5) automatically generates a 10% discount code
- **In-Memory Store**: No database required - perfect for development and testing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build TypeScript (production):
```bash
npm run build
npm start
```

For development with auto-reload (TypeScript compilation):
```bash
npm run dev
```

The server will start on `http://localhost:3000` by default.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

---

## Client APIs

### 1. Get Cart
Get the current cart for a user.

**Endpoint:** `GET /api/client/cart`

**Query Parameters:**
- `userId` (required): User identifier

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 100,
      "quantity": 2
    }
  ],
  "discountCode": null,
  "appliedDiscount": 0
}
```

**Example:**
```bash
curl "http://localhost:3000/api/client/cart?userId=user123"
```

---

### 2. Add Item to Cart
Add an item to the user's cart. If the item already exists, the quantity will be increased.

**Endpoint:** `POST /api/client/cart/add`

**Request Body:**
```json
{
  "userId": "user123",
  "item": {
    "id": "1",
    "name": "Product Name",
    "price": 100,
    "quantity": 1
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cart": {
    "items": [...],
    "discountCode": null,
    "appliedDiscount": 0
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/client/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "item": {
      "id": "1",
      "name": "Laptop",
      "price": 999.99,
      "quantity": 1
    }
  }'
```

---

### 3. Apply Discount Code
Apply a discount code to the cart. The code must be valid and not already used.

**Endpoint:** `POST /api/client/cart/apply-discount`

**Request Body:**
```json
{
  "userId": "user123",
  "discountCode": "DISCOUNT1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Discount code applied successfully",
  "cart": {
    "items": [...],
    "discountCode": "DISCOUNT1234567890",
    "appliedDiscount": 99.99
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/client/cart/apply-discount \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "discountCode": "DISCOUNT1234567890"
  }'
```

**Error Responses:**
- `400 Bad Request`: Invalid or already used discount code

---

### 4. Checkout
Checkout and place an order. The cart will be cleared after successful checkout.

**Endpoint:** `POST /api/client/checkout`

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": 1,
    "userId": "user123",
    "items": [...],
    "subtotal": 999.99,
    "discountCode": "DISCOUNT1234567890",
    "discount": 99.99,
    "total": 900.00,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/client/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

**Note:** If this is the nth order (default: every 5th order), a new discount code will be automatically generated.

---

## Admin APIs

### 1. Generate Discount Code
Generate a discount code if the nth order condition is satisfied. By default, a code is generated every 5 orders.

**Endpoint:** `POST /api/admin/generate-discount-code`

**Response:**
```json
{
  "success": true,
  "message": "Discount code generated successfully",
  "code": "DISCOUNT1234567890",
  "note": "This code is generated every 5 orders"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/admin/generate-discount-code
```

**Error Responses:**
- `400 Bad Request`: Condition not met (not the nth order yet)

---

### 2. Get Statistics
Get store statistics including total items purchased, total revenue, discount codes, and discount amounts.

**Endpoint:** `GET /api/admin/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "itemsPurchased": 15,
    "totalPurchaseAmount": 3500.50,
    "discountCodes": [
      {
        "code": "DISCOUNT1234567890",
        "isUsed": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "code": "DISCOUNT1234567891",
        "isUsed": false,
        "createdAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "totalDiscountAmount": 250.05,
    "totalOrders": 10
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/admin/statistics
```

---

## Business Logic

### Discount Code Generation
- Discount codes are automatically generated every **nth order** (default: 5)
- The value of `n` can be configured in `src/data/store.ts` (constant `NTH_ORDER`)
- Discount codes can only be used **once** before the next one becomes available
- Each discount code provides a **10% discount** on the entire order

### Discount Code Usage
- A discount code applies to the **entire order** (not individual items)
- The discount is calculated as 10% of the cart subtotal
- Once a discount code is used in an order, it cannot be reused

---

## Project Structure

```
├── src/
│   ├── server.ts            # Main server entry point
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── data/
│   │   └── store.ts         # In-memory data store and business logic
│   ├── controllers/
│   │   ├── clientController.ts  # Client API controllers
│   │   └── adminController.ts   # Admin API controllers
│   └── routes/
│       ├── clientRoutes.ts  # Client API routes
│       └── adminRoutes.ts   # Admin API routes
├── dist/                    # Compiled JavaScript (generated after build)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

---

## Configuration

### Change Nth Order Value
To change how often discount codes are generated, modify the `NTH_ORDER` constant in `src/data/store.ts`:

```typescript
export const NTH_ORDER = 5; // Change to your desired value
```

### Change Server Port
Set the `PORT` environment variable or modify the default in `server.js`:

```bash
PORT=4000 npm start
```

---

## Testing

Run tests (when implemented):
```bash
npm test
```

---

## Usage Example Flow

1. **Add items to cart:**
```bash
POST /api/client/cart/add
{
  "userId": "user1",
  "item": { "id": "1", "name": "Laptop", "price": 1000, "quantity": 1 }
}
```

2. **Apply discount code (optional):**
```bash
POST /api/client/cart/apply-discount
{
  "userId": "user1",
  "discountCode": "DISCOUNT1234567890"
}
```

3. **Checkout:**
```bash
POST /api/client/checkout
{
  "userId": "user1"
}
```

4. **After 5 orders, check admin statistics:**
```bash
GET /api/admin/statistics
```

5. **Generate discount code (if nth order condition met):**
```bash
POST /api/admin/generate-discount-code
```

---

## Notes

- All data is stored in-memory and will be lost when the server restarts
- This implementation is designed for development and testing purposes
- For production, consider implementing a persistent database

---

## License

ISC
