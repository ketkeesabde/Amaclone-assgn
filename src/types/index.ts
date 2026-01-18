/**
 * Type definitions for the ecommerce application
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
  createdAt: Date;
}

export interface DiscountCode {
  code: string;
  isUsed: boolean;
  createdAt: Date;
}

export interface Statistics {
  itemsPurchased: number;
  totalPurchaseAmount: number;
  discountCodes: DiscountCode[];
  totalDiscountAmount: number;
  totalOrders: number;
}

export interface AddToCartRequest {
  userId: string;
  item: CartItem;
}

export interface ApplyDiscountRequest {
  userId: string;
  discountCode: string;
}

export interface CheckoutRequest {
  userId: string;
}
