import React, { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
            isDanger ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <AlertTriangle size={28} className={isDanger ? 'text-red-500' : 'text-amber-500'} />
          </div>

          {/* Text */}
          <h3 className="text-lg font-bold text-[#333333] text-center mb-2">{title}</h3>
          <p className="text-sm text-gray-500 text-center leading-relaxed mb-7">{description}</p>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                isDanger
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Procesando...
                </span>
              ) : confirmLabel}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full text-sm font-medium text-gray-500 hover:text-[#333333] py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
