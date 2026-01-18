/**
 * Express server for Ecommerce Store API
 * Main entry point for the application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/clientRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Ecommerce Store API',
    version: '1.0.0',
    endpoints: {
      client: {
        'GET /api/client/cart': 'Get cart by userId',
        'POST /api/client/cart/add': 'Add item to cart',
        'POST /api/client/cart/apply-discount': 'Apply discount code to cart',
        'POST /api/client/checkout': 'Checkout and place order'
      },
      admin: {
        'POST /api/admin/generate-discount-code': 'Generate discount code (if nth order condition is met)',
        'GET /api/admin/statistics': 'Get store statistics'
      }
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}`);
});

export default app;
