import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchServices,
  fetchService,
  createService,
  updateService,
  deleteService,
  fetchAllServicesAdmin,
  type ServiceFilters,
} from '../services/services'
import type { Service } from '../types'

export const useServices = (filters: ServiceFilters = {}) =>
  useQuery({
    queryKey: ['services', filters],
    queryFn: () => fetchServices(filters),
  })

export const useService = (id: string) =>
  useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchService(id),
    enabled: !!id,
  })

export const useAllServicesAdmin = () =>
  useQuery({
    queryKey: ['admin-services'],
    queryFn: fetchAllServicesAdmin,
  })

export const useCreateService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => createService(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['admin-services'] })
    },
  })
}

export const useUpdateService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) =>
      updateService(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['admin-services'] })
    },
  })
}

export const useDeleteService = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      qc.invalidateQueries({ queryKey: ['admin-services'] })
    },
  })
}
