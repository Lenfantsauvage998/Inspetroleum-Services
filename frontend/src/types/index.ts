export type Role = 'user' | 'admin'

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR'

export type Category = string  // now dynamic — managed via categories table

export interface CategoryRecord {
  id: string
  label: string
  is_active: boolean
  created_at: string
}

export type PaymentMethod = 'PSE' | 'CARD' | 'EFECTY' | 'DAVIPLATA' | 'SAFETYPAY' | 'OTHER'

export interface Profile {
  id: string
  name: string
  role: Role
  created_at: string
}

export interface User extends Profile {
  email: string
  phone?: string | null
}

export interface Service {
  id: string
  title: string
  description: string
  category: Category
  price: number
  image_url: string | null
  image_urls: string[]
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  service_id: string
  quantity: number
  price: number
  service?: Service
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
  items?: OrderItem[]
  payment?: Payment
}

export interface AdminOrderItem {
  service_title: string
  category: Category
  quantity: number
  price: number
}

export interface AdminOrder extends Omit<Order, 'items'> {
  user_email: string
  user_name: string
  customer_phone?: string | null
  items?: AdminOrderItem[]
}

export interface Payment {
  id: string
  order_id: string
  gateway: string
  gateway_ref: string | null
  status: PaymentStatus
  amount: number
  currency: string
  method: PaymentMethod | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  service: Service
  quantity: number
}

export interface AdminStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalServices: number
  pendingOrders: number
  recentOrders: AdminOrder[]
}

// Default labels — extended at runtime with categories from DB
export const CATEGORY_LABELS: Record<string, string> = {
  OILFIELD_SERVICES: 'Oilfield Services',
  LNG: 'LNG',
  INDUSTRIAL_TECH: 'Industrial Technology',
  ENERGY_TRANSITION: 'Energy Transition',
}

export const getCategoryLabel = (id: string): string =>
  CATEGORY_LABELS[id] ?? id.replace(/_/g, ' ')

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PSE: 'PSE (Transferencia bancaria)',
  CARD: 'Tarjeta Crédito / Débito',
  EFECTY: 'Efecty',
  DAVIPLATA: 'Daviplata',
  SAFETYPAY: 'SafetyPay',
  OTHER: 'Otro',
}
