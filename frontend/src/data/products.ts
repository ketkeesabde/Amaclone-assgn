/**
 * Sample product data
 * In a real application, this would come from a database or API
 */

import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Laptop Pro',
    price: 1299.99,
    description: 'High-performance laptop for professionals',
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    price: 29.99,
    description: 'Ergonomic wireless mouse with long battery life',
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    price: 149.99,
    description: 'RGB mechanical keyboard with cherry switches',
  },
  {
    id: '4',
    name: 'Monitor 4K',
    price: 599.99,
    description: '27-inch 4K Ultra HD monitor',
  },
  {
    id: '5',
    name: 'Webcam HD',
    price: 79.99,
    description: '1080p HD webcam with auto-focus',
  },
  {
    id: '6',
    name: 'USB-C Hub',
    price: 49.99,
    description: 'Multi-port USB-C hub with HDMI output',
  },
];
