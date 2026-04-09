import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, RotateCcw, ArrowRight, AlertCircle, Copy, Check } from 'lucide-react'

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-[#8DBF2E] transition-colors flex-shrink-0"
      title="Copiar"
    >
      {copied ? <Check size={13} className="text-[#8DBF2E]" /> : <Copy size={13} />}
    </button>
  )
}

const DECLINE_REASONS: Record<string, string> = {
  INSUFFICIENT_FUNDS:      'Fondos insuficientes en la cuenta.',
  CARD_DECLINED:           'La tarjeta fue rechazada por el banco.',
  INVALID_CARD:            'Los datos de la tarjeta son incorrectos.',
  TRANSACTION_DECLINED:    'La transacción fue rechazada por el emisor.',
  CONTACT_ISSUER:          'Contacta a tu banco para autorizar el pago.',
  EXPIRED_CARD:            'La tarjeta está vencida.',
}

const CheckoutFailed: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const [searchParams] = useSearchParams()
  const orderId       = searchParams.get('order')
  const transactionId = searchParams.get('id')
  const reasonCode    = searchParams.get('reason')?.toUpperCase() ?? ''
  const friendlyReason = DECLINE_REASONS[reasonCode] ?? 'El pago no pudo ser procesado. Por favor intenta de nuevo.'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] px-4 pt-24 md:pt-36 pb-16">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">

        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-[#333333] mb-2">Pago rechazado</h1>
        <p className="text-gray-500 text-sm mb-6">Tu orden no fue completada y no se realizó ningún cobro.</p>

        {/* Reason banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-6 text-left">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{friendlyReason}</p>
        </div>

        {/* IDs */}
        {(orderId || transactionId) && (
          <div className="bg-[#F2F2F2] rounded-2xl px-5 py-4 mb-6 text-left space-y-3">
            {transactionId && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ID de transacción</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-semibold text-[#333333] break-all">{transactionId}</p>
                  <CopyButton value={transactionId} />
                </div>
              </div>
            )}
            {orderId && (
              <div className={transactionId ? 'border-t border-gray-200 pt-3' : ''}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ID de orden</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-semibold text-[#333333]">#{orderId.slice(0, 8).toUpperCase()}</p>
                  <CopyButton value={orderId} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* What to do next */}
        <div className="text-left mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">¿Qué puedo hacer?</p>
          <ul className="space-y-2">
            {[
              'Verifica que los datos de pago sean correctos',
              'Intenta con otro método de pago (PSE, Nequi, tarjeta)',
              'Contacta a tu banco si el problema persiste',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8DBF2E] flex-shrink-0 mt-1.5" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            to="/checkout"
            className="flex items-center justify-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <RotateCcw size={16} />
            Intentar de nuevo
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#333333] text-sm font-medium transition-colors"
          >
            Ver mis órdenes <ArrowRight size={14} />
          </Link>
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Volver al marketplace <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}

export default CheckoutFailed
