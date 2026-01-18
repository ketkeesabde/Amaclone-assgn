/**
 * In-memory data store for the ecommerce application
 * Stores carts, orders, and discount codes
 */

import { Cart, CartItem, Order, DiscountCode, Statistics } from '../types';

// In-memory storage
const carts: Record<string, Cart> = {};
const orders: Order[] = [];
const discountCodes: DiscountCode[] = [];
let orderCounter = 0; // Track total number of orders

// Configuration: every nth order gets a discount code
export const NTH_ORDER = 5; // Change this value as needed

/**
 * Get a cart by user ID
 */
export function getCart(userId: string): Cart {
  if (!carts[userId]) {
    carts[userId] = {
      items: [],
      discountCode: null,
      appliedDiscount: 0
    };
  }
  return carts[userId];
}

/**
 * Add item to cart
 */
export function addToCart(userId: string, item: CartItem): Cart {
  const cart = getCart(userId);
  const existingItem = cart.items.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += item.quantity || 1;
  } else {
    cart.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1
    });
  }
  
  return cart;
}

/**
 * Update cart item quantity
 * If quantity is 0 or less, removes the item from cart
 */
export function updateCartItemQuantity(userId: string, itemId: string, quantityChange: number): Cart {
  const cart = getCart(userId);
  const existingItem = cart.items.find(i => i.id === itemId);
  
  if (!existingItem) {
    throw new Error('Item not found in cart');
  }
  
  const newQuantity = existingItem.quantity + quantityChange;
  
  if (newQuantity <= 0) {
    // Remove item from cart
    cart.items = cart.items.filter(i => i.id !== itemId);
  } else {
    existingItem.quantity = newQuantity;
  }
  
  // Recalculate discount if one is applied
  if (cart.discountCode) {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.appliedDiscount = subtotal * 0.1;
  }
  
  return cart;
}

/**
 * Apply discount code to cart
 */

export function applyDiscountCode(userId: string, code: string): Cart {
  const cart = getCart(userId);
  const discountCodeObj = discountCodes.find(dc => dc.code === code);
  
  if (!discountCodeObj) {
    throw new Error('Invalid discount code');
  }
  
  if (discountCodeObj.isUsed) {
    throw new Error('Discount code has already been used');
  }
  
  cart.discountCode = code;
  // Calculate discount (10% of subtotal)
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.appliedDiscount = subtotal * 0.1; // 10% discount
  
  return cart;
}

/**
 * Create an order from cart
 */
export function createOrder(userId: string): Order {
  const cart = getCart(userId);
  
  if (cart.items.length === 0) {
    throw new Error('Cart is empty');
  }
  
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cart.appliedDiscount || 0;
  const total = subtotal - discount;
  
  orderCounter++;
  
  const order: Order = {
    id: orderCounter,
    userId: userId,
    items: [...cart.items],
    subtotal: subtotal,
    discountCode: cart.discountCode || null,
    discount: discount,
    total: total,
    createdAt: new Date()
  };
  
  orders.push(order);
  
  // Mark discount code as used if one was applied
  if (cart.discountCode) {
    const discountCodeObj = discountCodes.find(dc => dc.code === cart.discountCode);
    if (discountCodeObj) {
      discountCodeObj.isUsed = true;
    }
  }
  
  // Clear the cart
  carts[userId] = {
    items: [],
    discountCode: null,
    appliedDiscount: 0
  };
  
  // Check if this is the nth order (generate discount code)
  if (orderCounter % NTH_ORDER === 0) {
    generateDiscountCodeInternal();
  }
  
  return order;
}

/**
 * Generate a discount code (internal function)
 */
function generateDiscountCodeInternal(): string {
  const code = `DISCOUNT${Date.now()}`;
  discountCodes.push({
    code: code,
    isUsed: false,
    createdAt: new Date()
  });
  return code;
}

/**
 * Generate a discount code (admin function)
 * Only generates if condition is satisfied (every nth order)
 */
export function generateDiscountCode(): string {
  // Check if we should generate a code (every nth order)
  if (orderCounter % NTH_ORDER === 0) {
    return generateDiscountCodeInternal();
  }
  throw new Error(`Discount code can only be generated every ${NTH_ORDER} orders. Current order count: ${orderCounter}`);
}

/**
 * Get statistics for admin
 */
export function getStatistics(): Statistics {
  const itemsPurchased = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);
  
  const totalPurchaseAmount = orders.reduce((sum, order) => sum + order.total, 0);
  
  const discountCodesList: DiscountCode[] = discountCodes.map(dc => ({
    code: dc.code,
    isUsed: dc.isUsed,
    createdAt: dc.createdAt
  }));
  
  const totalDiscountAmount = orders.reduce((sum, order) => sum + order.discount, 0);
  
  return {
    itemsPurchased,
    totalPurchaseAmount,
    discountCodes: discountCodesList,
    totalDiscountAmount,
    totalOrders: orderCounter
  };
}
