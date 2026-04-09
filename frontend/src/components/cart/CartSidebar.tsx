import React from 'react'
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_LABELS } from '../../types'
import Button from '../ui/Button'

const CartSidebar: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const total = getTotal()

  const handleCheckout = () => {
    closeCart()
    if (!isAuthenticated) {
      navigate('/auth')
    } else {
      navigate('/checkout')
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#8DBF2E]" />
            <h2 className="font-semibold text-[#333333]">Tu carrito</h2>
            {items.length > 0 && (
              <span className="bg-[#8DBF2E] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center">
                <ShoppingCart size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-[#333333]">Tu carrito esta vacio</p>
                <p className="text-sm text-gray-500 mt-1">Echa un vistazo a nuestros servicios para empezar</p>
              </div>
              <Link
                to="/marketplace"
                onClick={closeCart}
                className="text-sm font-semibold text-[#8DBF2E] hover:text-[#6FA12A]"
              >
                Descubre nuestros servicios
              </Link>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.service.id} className="flex gap-4 p-3 bg-[#F2F2F2]/50 rounded-xl">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#A6CE39]/20 to-[#4F7F1F]/20 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ShoppingCart size={20} className="text-[#6FA12A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#333333] line-clamp-1">{item.service.title}</p>
                    <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.service.category]}</p>
                    <p className="text-sm font-bold text-[#8DBF2E] mt-1">
                      ${(item.service.price * item.quantity).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.service.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:border-[#8DBF2E] transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:border-[#8DBF2E] transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={clearCart}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors w-full text-right"
              >
                Eliminar productos
              </button>
            </>
          )}
        </div>

        {/* Footer with total & CTA */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-bold text-[#333333]">
                {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </span>
            </div>
            <p className="text-xs text-gray-500">Los impuestos y el precio final se muestran al finalizar la compra</p>
            <Button
              onClick={handleCheckout}
              variant="primary"
              className="w-full"
              size="lg"
            >
              {isAuthenticated ? 'Ir a pagar' : 'Inicia sesión para finalizar la compra'}
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default CartSidebar
