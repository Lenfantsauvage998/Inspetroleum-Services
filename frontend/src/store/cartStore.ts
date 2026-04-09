import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Service } from '../types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (service: Service) => void
  removeItem: (serviceId: string) => void
  updateQuantity: (serviceId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (service) => {
        const existing = get().items.find((i) => i.service.id === service.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.service.id === service.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, { service, quantity: 1 }] })
        }
      },

      removeItem: (serviceId) =>
        set({ items: get().items.filter((i) => i.service.id !== serviceId) }),

      updateQuantity: (serviceId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(serviceId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.service.id === serviceId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.service.price * i.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
