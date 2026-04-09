import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminStats, fetchAllOrders, fetchAllUsers, updateOrderStatus,
  deleteOrder, fetchCategories, createCategory, deleteCategory,
  deleteUser, setUserRole,
} from '../services/admin'
import type { OrderStatus } from '../types'

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  })

export const useAllOrders = () =>
  useQuery({
    queryKey: ['admin-orders'],
    queryFn: fetchAllOrders,
  })

export const useAllUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers,
  })

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export const useDeleteOrder = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => deleteOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

export const useCreateCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) => createCategory(id, label),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
}

export const useSetUserRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
      setUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })
}
