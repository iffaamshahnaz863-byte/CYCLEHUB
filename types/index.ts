
import { Database } from './supabase';

export type Product = Database['public']['Tables']['products']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CartItem = Database['public']['Tables']['cart']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export type CartItemWithProduct = CartItem & {
  products: Product | null;
};

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Product | null })[];
};

export type OrderStatus = Database['public']['Enums']['order_status'];

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled'
];
