import { supabase } from '../lib/supabase'
import type { Service, Category } from '../types'

export interface ServiceFilters {
  category?: Category
  search?: string
  minPrice?: number
  maxPrice?: number
}

export const fetchServices = async (filters: ServiceFilters = {}): Promise<Service[]> => {
  let query = supabase.from('services').select('*').eq('is_active', true)

  if (filters.category) query = query.eq('category', filters.category)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return (data as Service[]) ?? []
}

export const fetchService = async (id: string): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Service
}

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  const { data, error } = await supabase.from('services').insert(service).select().single()
  if (error) throw error
  return data as Service
}

export const updateService = async (id: string, updates: Partial<Service>): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Service
}

export const deleteService = async (id: string): Promise<void> => {
  const { error } = await supabase.rpc('admin_delete_service', { p_service_id: id })
  if (error) throw error
}

// Admin: fetch ALL services including inactive
export const fetchAllServicesAdmin = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Service[]) ?? []
}
