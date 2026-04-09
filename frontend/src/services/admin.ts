import { supabase } from '../lib/supabase'
import type { AdminOrder, AdminStats, User, OrderStatus, CategoryRecord } from '../types'

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data, error } = await supabase.rpc('admin_get_stats')
  if (error) throw error
  return data as AdminStats
}

export const fetchAllOrders = async (): Promise<AdminOrder[]> => {
  const { data, error } = await supabase.rpc('admin_get_all_orders')
  if (error) throw error
  // Function now returns JSON — may come back as array directly or nested
  if (Array.isArray(data)) return data as AdminOrder[]
  if (data && Array.isArray((data as { result?: unknown }).result)) return (data as { result: AdminOrder[] }).result
  return []
}

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase.rpc('admin_update_order_status', {
    order_id: orderId,
    new_status: status,
  })
  if (error) throw error
}

export const fetchAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.rpc('admin_get_all_users')
  if (error) throw error
  return (data as User[]) ?? []
}

export const deleteOrder = async (orderId: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) throw error
}

// ── Categories ────────────────────────────────────────────────

export const fetchCategories = async (): Promise<CategoryRecord[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as CategoryRecord[]) ?? []
}

export const createCategory = async (id: string, label: string): Promise<CategoryRecord> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({ id: id.trim().toUpperCase().replace(/\s+/g, '_'), label: label.trim() })
    .select()
    .single()
  if (error) throw error
  return data as CategoryRecord
}

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

// ── User management ───────────────────────────────────────────

export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
  if (error) throw error
}

export const setUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
  const { error } = await supabase.rpc('admin_set_user_role', { p_user_id: userId, p_role: role })
  if (error) throw error
}
