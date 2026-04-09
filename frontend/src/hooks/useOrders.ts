import { useQuery } from '@tanstack/react-query'
import { fetchMyOrders, fetchOrder } from '../services/orders'

export const useMyOrders = () =>
  useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    staleTime: 0,              // always treat cache as stale — re-fetch on every mount
    refetchOnWindowFocus: true, // re-fetch when user returns to the tab from checkout
  })

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  })
