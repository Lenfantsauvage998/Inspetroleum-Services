import React from 'react'
import type { OrderStatus, Category, PaymentStatus } from '../../types'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#A6CE39]/20 text-[#4F7F1F]',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
  >
    {children}
  </span>
)

export default Badge

// Convenience components
export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const variants: Record<OrderStatus, BadgeVariant> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  }
  const labels: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  const variants: Record<PaymentStatus, BadgeVariant> = {
    PENDING: 'warning',
    APPROVED: 'success',
    DECLINED: 'danger',
    VOIDED: 'gray',
    ERROR: 'danger',
  }
  return <Badge variant={variants[status]}>{status}</Badge>
}

export const CategoryBadge: React.FC<{ category: Category }> = ({ category }) => {
  const labels: Record<Category, string> = {
    OILFIELD_SERVICES: 'Oilfield',
    LNG: 'LNG',
    INDUSTRIAL_TECH: 'Industrial',
    ENERGY_TRANSITION: 'Energy Transition',
  }
  return <Badge variant="primary">{labels[category]}</Badge>
}
