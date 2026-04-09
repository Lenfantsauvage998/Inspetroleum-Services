import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle2, XCircle, ShoppingBag, ArrowRight, Copy, Check, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useMyOrders } from '../../hooks/useOrders'
import { OrderStatusBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { CATEGORY_LABELS, type Order, type OrderStatus } from '../../types'

const CopyId: React.FC<{ id: string }> = ({ id }) => {
  const [copied, setCopied] = useState(false)
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} className="ml-1 p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-[#8DBF2E] transition-colors" title="Copiar ID completo">
      {copied ? <Check size={12} className="text-[#8DBF2E]" /> : <Copy size={12} />}
    </button>
  )
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock size={16} className="text-yellow-500" />,
  PROCESSING: <Package size={16} className="text-blue-500" />,
  COMPLETED: <CheckCircle2 size={16} className="text-green-500" />,
  CANCELLED: <XCircle size={16} className="text-red-500" />,
}

const UserDashboard: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const { user } = useAuthStore()
  const { data: orders = [], isLoading } = useMyOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showToast, setShowToast] = useState(() => searchParams.get('new') === '1')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSearchParams({}, { replace: true })
      // Immediately invalidate the orders cache so the new order
      // appears without the user having to manually reload the page
      queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      const t = setTimeout(() => setShowToast(false), 6000)
      return () => clearTimeout(t)
    }
  }, [])

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'PENDING').length,
    processing: orders.filter((o) => o.status === 'PROCESSING').length,
    completed: orders.filter((o) => o.status === 'COMPLETED').length,
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 md:pt-36 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#8DBF2E] text-sm font-semibold uppercase tracking-widest mb-2">My Account</p>
          <h1 className="text-3xl font-extrabold text-[#333333]">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
        </div>

        {/* Purchase success toast */}
        {showToast && (
          <div className="mb-8 flex items-start gap-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 shadow-sm animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-800 text-sm">¡Compra realizada exitosamente!</p>
              <p className="text-green-700 text-xs mt-0.5">Tu orden ha sido registrada y está siendo procesada. Puedes ver el estado actualizado abajo.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="text-green-400 hover:text-green-600 transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Orders', value: stats.total, color: 'bg-gray-50', icon: <ShoppingBag size={20} className="text-gray-500" /> },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50', icon: <Clock size={20} className="text-yellow-500" /> },
            { label: 'Processing', value: stats.processing, color: 'bg-blue-50', icon: <Package size={20} className="text-blue-500" /> },
            { label: 'Completed', value: stats.completed, color: 'bg-green-50', icon: <CheckCircle2 size={20} className="text-green-500" /> },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-2xl p-5 border border-gray-100`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</span>
                {s.icon}
              </div>
              <div className="text-3xl font-extrabold text-[#333333]">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-[#333333]">My Orders</h2>
            <Link
              to="/marketplace"
              className="flex items-center gap-1 text-sm text-[#8DBF2E] hover:text-[#6FA12A] transition-colors font-semibold"
            >
              Order More <ArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="font-medium text-[#333333]">No orders yet</p>
              <p className="text-gray-500 text-sm mt-1 mb-6">Start by browsing our services marketplace</p>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 bg-[#8DBF2E] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#6FA12A] transition-colors text-sm"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F2F2F2]/60">
                  <tr>
                    {['Order ID', 'Date', 'Services', 'Total', 'Status', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F2F2F2]/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {statusIcons[order.status]}
                          <span className="text-sm font-mono text-gray-600">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <CopyId id={order.id} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('es-CO', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.items?.length ?? '—'} service{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#333333]">
                          ${Number(order.total_amount).toLocaleString('es-CO')} COP
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs font-semibold text-[#8DBF2E] hover:text-[#6FA12A] transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-xs font-mono text-gray-400">{selectedOrder.id}</p>
                  <CopyId id={selectedOrder.id} />
                </div>
              </div>
              <OrderStatusBadge status={selectedOrder.status} />
            </div>

            <div className="space-y-3">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-[#F2F2F2] rounded-xl">
                  <div className="w-12 h-12 bg-[#8DBF2E]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package size={18} className="text-[#6FA12A]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#333333]">{item.service?.title || 'Service'}</p>
                    {item.service && (
                      <p className="text-xs text-gray-500">{CATEGORY_LABELS[item.service.category]}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#333333]">×{item.quantity}</p>
                    <p className="text-xs text-gray-500">${Number(item.price).toLocaleString('es-CO')} each</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex justify-between font-bold text-[#333333]">
                <span>Total</span>
                <span className="text-[#8DBF2E] text-lg">
                  ${Number(selectedOrder.total_amount).toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>

            {selectedOrder.payment && (
              <div className="bg-[#F2F2F2] rounded-xl p-4 text-sm">
                <p className="font-semibold text-[#333333] mb-2">Payment Info</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{selectedOrder.payment.method || 'N/A'}</span>
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium">{selectedOrder.payment.status}</span>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default UserDashboard
