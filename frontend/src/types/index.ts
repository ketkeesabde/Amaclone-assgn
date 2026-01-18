/**
 * Type definitions for the frontend application
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  discountCode: string | null;
  appliedDiscount: number;
}

export interface Order {
  id: number;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discountCode: string | null;
  discount: number;
  total: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export interface DiscountCode {
  code: string;
  isUsed: boolean;
  createdAt: string;
}

export interface Statistics {
  itemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodes: DiscountCode[];
  totalDiscountAmount: number;
  totalOrders: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  cart?: T;
  order?: T;
  code?: string;
  error?: string;
}
