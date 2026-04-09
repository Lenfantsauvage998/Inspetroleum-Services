import React, { useState, useEffect, useRef } from 'react'
import {
  BarChart3, ShoppingBag, Users, Package, Clock,
  Edit, Trash2, Plus, AlertCircle, Check,
  ChevronDown, ChevronUp, Mail, User, Hash, Tag, X, Phone, Upload, ImageIcon,
  Search, Shield, ShieldOff,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import {
  useAdminStats, useAllOrders, useAllUsers, useUpdateOrderStatus,
  useDeleteOrder, useCategories, useCreateCategory, useDeleteCategory,
  useDeleteUser, useSetUserRole,
} from '../../hooks/useAdminData'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAllServicesAdmin, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices'
import { OrderStatusBadge } from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import { getCategoryLabel, type OrderStatus, type Service, type Category, type AdminOrder } from '../../types'

type AdminTab = 'overview' | 'orders' | 'services' | 'users'

const AdminDashboard: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Resumen', icon: <BarChart3 size={16} /> },
    { id: 'orders', label: 'Ordenes', icon: <ShoppingBag size={16} /> },
    { id: 'services', label: 'Productos', icon: <Package size={16} /> },
    { id: 'users', label: 'Usuarios', icon: <Users size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 md:pt-36 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#8DBF2E] text-sm font-semibold uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="text-3xl font-extrabold text-[#333333]">Dashboard</h1>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#8DBF2E] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[#333333]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  )
}

// ── Overview Tab ─────────────────────────────────────────────

const OverviewTab: React.FC = () => {
  const { data: stats, isLoading } = useAdminStats()

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ordenes Totales', value: stats.totalOrders, icon: <ShoppingBag size={20} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Ganancia', value: `$${Number(stats.totalRevenue).toLocaleString('es-CO')}`, icon: <BarChart3 size={20} />, color: 'bg-green-50 text-green-600' },
          { label: 'Usuarios', value: stats.totalUsers, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Productos Activos', value: stats.totalServices, icon: <Package size={20} />, color: 'bg-orange-50 text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
              {s.icon}
            </div>
            <div className="text-2xl font-extrabold text-[#333333]">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending orders alert */}
      {stats.pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 text-sm">
          <Clock size={16} className="text-yellow-600 flex-shrink-0" />
          <span className="text-yellow-800">
            <strong>{stats.pendingOrders}</strong> Ordenes estan pendiente — revisalas en la pestaña Ordenes
          </span>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#333333]">Ordenes Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]/60">
              <tr>
                {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.recentOrders || []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-sm text-[#333333]">{order.user_name}</td>
                  <td className="px-5 py-3 text-sm font-semibold">${Number(order.total_amount).toLocaleString('es-CO')}</td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Orders Tab ───────────────────────────────────────────────

type GroupBy = 'none' | 'month' | 'customer'

const groupOrders = (orders: AdminOrder[], by: GroupBy): Record<string, AdminOrder[]> => {
  if (by === 'none') return { '': orders }
  return orders.reduce<Record<string, AdminOrder[]>>((acc, o) => {
    const key = by === 'month'
      ? new Date(o.created_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
      : `${o.user_name} — ${o.user_email}`
    ;(acc[key] ??= []).push(o)
    return acc
  }, {})
}

const OrderRow: React.FC<{
  order: AdminOrder
  onStatusChange: (id: string, s: OrderStatus) => void
  onDelete: (id: string) => void
  updating: string | null
}> = ({ order, onStatusChange, onDelete, updating }) => {
  const [expanded, setExpanded] = useState(false)
  const items = order.items ?? []

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp size={14} className="text-[#8DBF2E]" /> : <ChevronDown size={14} className="text-gray-400" />}
            <span className="text-sm font-mono text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </td>
        <td className="px-5 py-3">
          <p className="text-sm font-medium text-[#333333]">{order.user_name}</p>
          {items.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {items.map(i => `${i.service_title}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ')}
            </p>
          )}
        </td>
        <td className="px-5 py-3 text-sm font-semibold">${Number(order.total_amount).toLocaleString('es-CO')}</td>
        <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
        <td className="px-5 py-3 text-sm text-gray-500">
          {new Date(order.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
          {updating === order.id ? <Spinner size="sm" /> : (
            <select
              value={order.status}
              onChange={e => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:border-[#8DBF2E] outline-none"
            >
              {(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as OrderStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </td>
        <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onDelete(order.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
            title="Delete order"
          >
            <Trash2 size={14} />
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-[#F2F2F2]/50">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer Info</p>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-[#8DBF2E] flex-shrink-0" />
                  <span className="font-medium text-[#333333]">{order.user_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-[#8DBF2E] flex-shrink-0" />
                  <a href={`mailto:${order.user_email}`} className="text-[#8DBF2E] hover:underline break-all">{order.user_email}</a>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-[#8DBF2E] flex-shrink-0" />
                    <a href={`tel:${order.customer_phone}`} className="text-[#8DBF2E] hover:underline">{order.customer_phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Hash size={14} className="text-[#8DBF2E] flex-shrink-0" />
                  <span className="text-gray-400 font-mono text-xs">{order.id}</span>
                </div>
              </div>
              {/* Services */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Productos Ordenados</p>
                {items.length === 0 ? <p className="text-sm text-gray-400 italic">No items found</p> : (
                  <div className="space-y-2">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium text-[#333333]">{item.service_title}</p>
                          <p className="text-xs text-gray-400">{getCategoryLabel(item.category)} · qty {item.quantity}</p>
                        </div>
                        <span className="font-semibold">${(Number(item.price) * item.quantity).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-sm">
                      <span>Total</span>
                      <span className="text-[#8DBF2E]">${Number(order.total_amount).toLocaleString('es-CO')} COP</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

const OrdersTab: React.FC = () => {
  const { data: orders = [], isLoading } = useAllOrders()
  const { mutate: updateStatus } = useUpdateOrderStatus()
  const { mutate: deleteOrderMut, isPending: deletingOrder } = useDeleteOrder()
  const [updating, setUpdating] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; label: string } | null>(null)

  const handleStatus = (orderId: string, status: OrderStatus) => {
    setUpdating(orderId)
    updateStatus({ orderId, status }, { onSettled: () => setUpdating(null) })
  }

  const handleDeleteOrder = () => {
    if (!deleteConfirm) return
    deleteOrderMut(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) })
  }

  const grouped = groupOrders(orders, groupBy)

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-[#333333]">Todas las ordenes({orders.length})</h2>
          <p className="text-xs text-gray-400 mt-0.5">Haz clic en cualquier fila para ver los detalles del cliente y del servicio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Agrupa por:</span>
          {(['none', 'month', 'customer'] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                groupBy === g ? 'bg-[#8DBF2E] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8DBF2E]'
              }`}
            >
              {g === 'none' ? 'None' : g === 'month' ? 'Month' : 'Customer'}
            </button>
          ))}
        </div>
      </div>

      {/* Tables per group */}
      {Object.entries(grouped).map(([groupKey, groupOrders]) => (
        <div key={groupKey} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {groupKey && (
            <div className="px-6 py-3 bg-[#F2F2F2]/70 border-b border-gray-100 flex items-center gap-2">
              <span className="text-sm font-bold text-[#333333] capitalize">{groupKey}</span>
              <span className="text-xs text-gray-400">({groupOrders.length} order{groupOrders.length !== 1 ? 's' : ''})</span>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F2F2F2]/60">
                <tr>
                  {['ID de orden', 'Cliente / Servicio', 'Total', 'Estado', 'Fecha', 'Actualizacion', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groupOrders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatus}
                    onDelete={(id) => setDeleteConfirm({ id, label: `#${id.slice(0, 8).toUpperCase()}` })}
                    updating={updating}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => !deletingOrder && setDeleteConfirm(null)}
        onConfirm={handleDeleteOrder}
        loading={deletingOrder}
        variant="danger"
        title="¿Eliminar orden?"
        description={`Estás a punto de eliminar permanentemente la orden ${deleteConfirm?.label}. Esta acción no se puede deshacer.`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
      />
    </div>
  )
}

// ── Image upload field ───────────────────────────────────────
const ImageField: React.FC<{ value: string | null; onChange: (url: string | null) => void }> = ({ value, onChange }) => {
  const [mode, setMode] = useState<'upload' | 'url'>(value && !value.startsWith('blob') ? 'upload' : 'upload')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadError('El archivo debe ser una imagen'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Máximo 5 MB'); return }
    setUploading(true); setUploadError('')
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `service-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('service-images').upload(filename, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('service-images').getPublicUrl(filename)
      onChange(data.publicUrl)
    } catch (err: unknown) {
      setUploadError((err as Error).message ?? 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#333333]">Image</label>
        <div className="flex gap-1">
          {(['upload', 'url'] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-colors ${mode === m ? 'bg-[#8DBF2E] text-white' : 'text-gray-500 hover:text-[#8DBF2E]'}`}>
              {m === 'upload' ? 'Upload' : 'URL'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragging ? 'border-[#8DBF2E] bg-[#8DBF2E]/5 scale-[1.01]' : 'border-gray-200 hover:border-[#8DBF2E]/60 hover:bg-gray-50'}`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Spinner />
              <p className="text-xs text-gray-400">Subiendo imagen...</p>
            </div>
          ) : value ? (
            <div className="flex items-center gap-3 w-full">
              <img src={value} alt="preview" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{value.split('/').pop()}</p>
                <p className="text-xs text-[#8DBF2E] mt-0.5">Click o arrastra para reemplazar</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); onChange(null) }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-[#8DBF2E]/10 flex items-center justify-center">
                <Upload size={18} className="text-[#8DBF2E]" />
              </div>
              <p className="text-sm font-medium text-[#333333]">Arrastra la imagen aquí o haz click para buscar</p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP — máx. 5 MB</p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="url"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value
              if (!v) { onChange(null); return }
              if (!v.startsWith('https://')) { return } // silently block non-https
              onChange(v)
            }}
            placeholder="https://example.com/imagen.jpg"
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 outline-none"
          />
          {value && !value.startsWith('https://') && (
            <p className="text-xs text-red-500">La URL debe comenzar con https://</p>
          )}
          {value && (
            <div className="relative">
              <img src={value} alt="preview" className="w-full h-36 object-cover rounded-xl border border-gray-100"
                onError={(e) => (e.currentTarget.style.display = 'none')} />
              <button type="button" onClick={() => onChange(null)}
                className="absolute top-2 right-2 p-1 rounded-lg bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors shadow-sm">
                <X size={14} />
              </button>
            </div>
          )}
          {!value && (
            <div className="flex items-center gap-2 py-4 justify-center text-gray-400">
              <ImageIcon size={16} /><span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <AlertCircle size={12} /> {uploadError}
        </p>
      )}
    </div>
  )
}

// ── Services Tab ─────────────────────────────────────────────

const emptyService: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  description: '',
  category: 'OILFIELD_SERVICES',
  price: 0,
  image_url: null,
  image_urls: [],
  features: [],
  is_active: true,
}

// ── Gallery (multi-image) field ──────────────────────────────
const GalleryField: React.FC<{ value: string[]; onChange: (urls: string[]) => void }> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const uploadOne = async (file: File) => {
    if (!file.type.startsWith('image/')) { setUploadError('El archivo debe ser una imagen'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Máximo 5 MB'); return }
    setUploading(true); setUploadError('')
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const filename = `service-gallery-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('service-images').upload(filename, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('service-images').getPublicUrl(filename)
      onChange([...value, data.publicUrl])
    } catch (err: unknown) {
      setUploadError((err as Error).message ?? 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#333333]">Gallery Images</label>
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden border border-gray-100 aspect-square">
              <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 p-1 rounded-lg bg-black/50 hover:bg-red-500 text-white transition-colors"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadOne(f); if (fileRef.current) fileRef.current.value = '' }} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-[#8DBF2E]/60 rounded-xl py-3 text-sm text-gray-500 hover:text-[#8DBF2E] transition-colors disabled:opacity-50"
      >
        {uploading ? <><Spinner size="sm" /> Subiendo...</> : <><Plus size={15} /> Agregar imagen</>}
      </button>
      {uploadError && <p className="text-xs text-red-500 flex items-center gap-1.5"><AlertCircle size={12} />{uploadError}</p>}
    </div>
  )
}

const ServicesTab: React.FC = () => {
  const { data: services = [], isLoading } = useAllServicesAdmin()
  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { mutate: create, isPending: creating } = useCreateService()
  const { mutate: update, isPending: updating } = useUpdateService()
  const { mutate: remove } = useDeleteService()
  const { mutate: createCat, isPending: creatingCat } = useCreateCategory()
  const { mutate: deleteCat } = useDeleteCategory()

  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState<Omit<Service, 'id' | 'created_at' | 'updated_at'>>(emptyService)
  const [featuresText, setFeaturesText] = useState('')
  const [error, setError] = useState('')
  const [newCatLabel, setNewCatLabel] = useState('')
  const [catError, setCatError] = useState('')
  const [showCatManager, setShowCatManager] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'service' | 'category'; id: string; label: string } | null>(null)
  const [deletingItem, setDeletingItem] = useState(false)

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return
    setDeletingItem(true)
    if (deleteConfirm.type === 'service') {
      remove(deleteConfirm.id, { onSuccess: () => { setDeleteConfirm(null); setDeletingItem(false) }, onError: () => setDeletingItem(false) })
    } else {
      deleteCat(deleteConfirm.id, { onSuccess: () => { setDeleteConfirm(null); setDeletingItem(false) }, onError: () => setDeletingItem(false) })
    }
  }

  const openCreate = () => {
    setForm({ ...emptyService, category: categories[0]?.id ?? 'OILFIELD_SERVICES' })
    setFeaturesText(''); setError(''); setModal('create')
  }

  const openEdit = (svc: Service) => {
    setEditingService(svc)
    setForm({ title: svc.title, description: svc.description, category: svc.category, price: svc.price, image_url: svc.image_url, image_urls: svc.image_urls ?? [], features: svc.features, is_active: svc.is_active })
    setFeaturesText(svc.features.join('\n')); setError(''); setModal('edit')
  }

  const handleSave = () => {
    const missing: string[] = []
    if (!form.title.trim()) missing.push('Título')
    if (!form.description.trim()) missing.push('Descripción')
    if (!form.price) missing.push('Precio')
    if (missing.length > 0) {
      setError(`Los siguientes campos son obligatorios: ${missing.join(', ')}`)
      return
    }
    const data = { ...form, features: featuresText.split('\n').map(f => f.trim()).filter(Boolean) }
    if (modal === 'create') {
      create(data, { onSuccess: () => setModal(null), onError: () => setError('Failed to create service') })
    } else if (modal === 'edit' && editingService) {
      update({ id: editingService.id, updates: data }, { onSuccess: () => setModal(null), onError: () => setError('Failed to update service') })
    }
  }

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) { setCatError('Category name is required'); return }
    setCatError('')
    createCat(
      { id: newCatLabel, label: newCatLabel },
      { onSuccess: () => setNewCatLabel(''), onError: () => setCatError('Failed to create category') }
    )
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      {/* ── Category Manager ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <button
          onClick={() => setShowCatManager(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-[#8DBF2E]" />
            <span className="font-semibold text-[#333333]">Manago de categorias</span>
            <span className="text-xs bg-[#F2F2F2] text-gray-500 px-2 py-0.5 rounded-full">{categories.length}</span>
          </div>
          {showCatManager ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showCatManager && (
          <div className="px-6 pb-5 border-t border-gray-100">
            {/* Existing categories */}
            <div className="flex flex-wrap gap-2 mt-4 mb-4">
              {catsLoading ? <Spinner size="sm" /> : categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 bg-[#F2F2F2] rounded-lg px-3 py-1.5 text-sm font-medium text-[#333333]">
                  <span>{cat.label}</span>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, label: cat.label })}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            {/* Add new */}
            <div className="flex items-center gap-2">
              <input
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name…"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 outline-none"
              />
              <Button onClick={handleAddCategory} loading={creatingCat} size="sm">
                <Plus size={14} /> Add
              </Button>
            </div>
            {catError && <p className="text-red-500 text-xs mt-1">{catError}</p>}
          </div>
        )}
      </div>

      {/* ── Services Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#333333]">Productos ({services.length})</h2>
          <Button onClick={openCreate} size="sm"><Plus size={15} /> Agregar Producto</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]/60">
              <tr>
                {['Title', 'Category', 'Price (COP)', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-[#333333] max-w-xs truncate">{svc.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{svc.description}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{getCategoryLabel(svc.category)}</td>
                  <td className="px-5 py-3 text-sm font-semibold">${Number(svc.price).toLocaleString('es-CO')}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${svc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {svc.is_active ? <><Check size={11} /> Active</> : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(svc)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><Edit size={14} /></button>
                      <button onClick={() => setDeleteConfirm({ type: 'service', id: svc.id, label: svc.title })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Incluye nuevo servicio' : 'Edita Servicio'} size="lg">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 120) })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 2000) })} rows={3} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#333333]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#333333]">Price (COP)</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.price === 0 ? '' : String(form.price)}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, '')
                  setForm({ ...form, price: clean === '' ? 0 : Number(clean) })
                }}
                placeholder="Ej: 450000"
                required
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 outline-none"
              />
            </div>
          </div>
          <ImageField
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
          <GalleryField
            value={form.image_urls}
            onChange={(urls) => setForm({ ...form, image_urls: urls })}
          />
          <Textarea
            label="Features (one per line)"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            rows={4}
            placeholder="Directional drilling&#10;MWD/LWD services&#10;24/7 support"
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#8DBF2E]"
            />
            <label htmlFor="is_active" className="text-sm text-[#333333]">Active (visible in marketplace)</label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} loading={creating || updating} className="flex-1">
              {modal === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </Button>
            <Button onClick={() => setModal(null)} variant="outline">Cancel</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => !deletingItem && setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        loading={deletingItem}
        variant="danger"
        title={deleteConfirm?.type === 'service' ? '¿Eliminar producto?' : '¿Eliminar categoría?'}
        description={
          deleteConfirm?.type === 'service'
            ? `Estás a punto de eliminar permanentemente el producto "${deleteConfirm?.label}". Esta acción no se puede deshacer.`
            : `Estás a punto de eliminar la categoría "${deleteConfirm?.label}". Los productos que la usan conservarán su valor actual.`
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
      />
    </>
  )
}

// ── Users Tab ────────────────────────────────────────────────

const UsersTab: React.FC = () => {
  const { data: users = [], isLoading } = useAllUsers()
  const deleteUser = useDeleteUser()
  const setRole = useSetUserRole()

  const [search, setSearch] = useState('')
  const [filterField, setFilterField] = useState<'name' | 'email' | 'phone'>('name')

  // Confirm modal state
  const [confirm, setConfirm] = useState<{
    type: 'delete' | 'promote' | 'demote'
    userId: string
    userName: string
  } | null>(null)

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    if (!q) return true
    if (filterField === 'name') return u.name.toLowerCase().includes(q)
    if (filterField === 'email') return u.email.toLowerCase().includes(q)
    if (filterField === 'phone') return (u.phone ?? '').toLowerCase().includes(q)
    return true
  })

  const handleConfirm = async () => {
    if (!confirm) return
    if (confirm.type === 'delete') {
      await deleteUser.mutateAsync(confirm.userId)
    } else {
      await setRole.mutateAsync({
        userId: confirm.userId,
        role: confirm.type === 'promote' ? 'admin' : 'user',
      })
    }
    setConfirm(null)
  }

  const isPending = deleteUser.isPending || setRole.isPending

  const filterLabels: Record<typeof filterField, string> = {
    name: 'Nombre',
    email: 'Correo',
    phone: 'Teléfono',
  }

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header + search */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="font-semibold text-[#333333]">Usuarios ({filtered.length})</h2>
            <p className="text-xs text-gray-400 mt-0.5">Gestiona roles y acceso de los usuarios</p>
          </div>

          <div className="sm:ml-auto flex items-center gap-2">
            {/* Filter field selector */}
            <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
              {(['name', 'email', 'phone'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterField(f)}
                  className={`px-3 py-2 transition-colors ${
                    filterField === f
                      ? 'bg-[#8DBF2E] text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {filterLabels[f]}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Buscar por ${filterLabels[filterField].toLowerCase()}…`}
                className="pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 outline-none w-52"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F2F2F2]/60">
              <tr>
                {['Usuario', 'Correo electrónico', 'Teléfono', 'Rol', 'Registro', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F2F2F2]/40 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#8DBF2E]/15 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[#4F7F1F] font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-[#333333]">{user.name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>
                    {/* Phone */}
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {user.phone ?? <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    {/* Role badge */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-[#8DBF2E]/20 text-[#4F7F1F]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-5 py-3.5 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Promote / demote */}
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => setConfirm({ type: 'demote', userId: user.id, userName: user.name })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                            title="Quitar rol de administrador"
                          >
                            <ShieldOff size={12} />
                            Quitar admin
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirm({ type: 'promote', userId: user.id, userName: user.name })}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#4F7F1F] hover:text-[#3a5f16] bg-[#8DBF2E]/10 hover:bg-[#8DBF2E]/20 px-3 py-1.5 rounded-lg transition-colors"
                            title="Promover a administrador"
                          >
                            <Shield size={12} />
                            Hacer admin
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          onClick={() => setConfirm({ type: 'delete', userId: user.id, userName: user.name })}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={!!confirm}
        onClose={() => !isPending && setConfirm(null)}
        onConfirm={handleConfirm}
        loading={isPending}
        variant={confirm?.type === 'delete' ? 'danger' : 'warning'}
        title={
          confirm?.type === 'delete'
            ? '¿Eliminar usuario?'
            : confirm?.type === 'promote'
            ? '¿Promover a administrador?'
            : '¿Quitar rol de administrador?'
        }
        description={
          confirm?.type === 'delete'
            ? `Estás a punto de eliminar permanentemente la cuenta de "${confirm?.userName}". Esta acción no se puede deshacer.`
            : confirm?.type === 'promote'
            ? `"${confirm?.userName}" tendrá acceso completo al panel de administración, incluyendo la gestión de usuarios, órdenes y servicios.`
            : `"${confirm?.userName}" perderá el acceso al panel de administración y volverá a ser un usuario regular.`
        }
        confirmLabel={
          confirm?.type === 'delete'
            ? 'Sí, eliminar'
            : confirm?.type === 'promote'
            ? 'Sí, promover'
            : 'Sí, quitar admin'
        }
        cancelLabel="Cancelar"
      />
    </>
  )
}

export default AdminDashboard
