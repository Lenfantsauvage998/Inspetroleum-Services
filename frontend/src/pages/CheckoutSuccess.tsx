import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock, ArrowRight, LayoutDashboard, Copy, Check } from 'lucide-react'
import { checkPaymentLive } from '../services/payments'
import { cancelOrder } from '../services/orders'
import Spinner from '../components/ui/Spinner'
import type { PaymentStatus } from '../types'

// Polling limits
const MAX_POLL_ATTEMPTS = 150  // 5 minutes at 2 s/poll — then auto-cancel
const SLOW_THRESHOLD    = 30   // 60 s — show "taking longer" message

// Map ePayco x_cod_response → our PaymentStatus
const EPAYCO_CODE_MAP: Record<string, PaymentStatus> = {
  '1': 'APPROVED',
  '2': 'DECLINED',
  '3': 'PENDING',
  '4': 'ERROR',
}

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // ePayco appends these to the response URL after payment
  const xCodResponse   = searchParams.get('x_cod_response')
  const xRefPayco      = searchParams.get('x_ref_payco')
  const xTransactionId = searchParams.get('x_transaction_id')

  // Our order ID — either from our own ?order= param or from ePayco's x_id_invoice
  const orderId = searchParams.get('order') || searchParams.get('x_id_invoice')

  // If ePayco already told us the result via URL params, use it immediately
  const immediateStatus = xCodResponse ? EPAYCO_CODE_MAP[xCodResponse] ?? null : null

  const [status, setStatus]   = useState<PaymentStatus | null>(immediateStatus)
  // Only poll if no immediate result from ePayco URL params
  const [polling, setPolling] = useState(!immediateStatus && !!orderId)
  const [attempts, setAttempts] = useState(0)
  const [isSlow, setIsSlow]   = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)

  // Scroll to top immediately
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    if (!orderId) return

    const poll = async () => {
      try {
        const { status: liveStatus } = await checkPaymentLive(orderId)

        if (liveStatus && liveStatus !== 'PENDING' && liveStatus !== 'NOT_FOUND') {
          setStatus(liveStatus as PaymentStatus)
          setPolling(false)
          setCanRefresh(false)
          return
        }
      } catch {
        // Network error — keep polling
      }

      if (attempts >= SLOW_THRESHOLD) setIsSlow(true)

      if (attempts >= MAX_POLL_ATTEMPTS) {
        setPolling(false)
        try { await cancelOrder(orderId) } catch { /* best-effort */ }
        navigate('/checkout/failed?reason=timeout', { replace: true })
        return
      }

      setAttempts((a) => a + 1)
    }

    if (polling) {
      const timer = setTimeout(poll, 2000)
      return () => clearTimeout(timer)
    }
  }, [polling, attempts, orderId, navigate])

  const handleRefresh = () => {
    setAttempts(0)
    setCanRefresh(false)
    setPolling(true)
  }

  // No order ID at all — generic success (shouldn't normally happen)
  if (!orderId) {
    return <SuccessContent status="APPROVED" />
  }

  if (polling) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] px-4">
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-md w-full">
          <div className="flex justify-center mb-6">
            <Spinner size="lg" />
          </div>
          <h2 className="text-xl font-bold text-[#333333] mb-2">Procesando pago</h2>
          {isSlow ? (
            <>
              <p className="text-gray-500 text-sm">
                Esperando confirmación de tu banco. Si tienes la página de ePayco abierta, completa el pago allí.
              </p>
              <p className="text-xs text-amber-600 mt-3 bg-amber-50 rounded-xl px-4 py-2">
                Tu orden se cancelará automáticamente si el pago no se completa en 5 minutos.
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">
              Confirmando tu pago. Esto puede tomar unos segundos...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <SuccessContent
      status={status || 'PENDING'}
      orderId={orderId ?? undefined}
      transactionId={xTransactionId ?? xRefPayco ?? undefined}
      canRefresh={canRefresh}
      onRefresh={handleRefresh}
    />
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-[#8DBF2E] transition-colors flex-shrink-0"
      title="Copiar"
    >
      {copied ? <Check size={13} className="text-[#8DBF2E]" /> : <Copy size={13} />}
    </button>
  )
}

const SuccessContent: React.FC<{
  status: PaymentStatus
  orderId?: string
  transactionId?: string
  canRefresh?: boolean
  onRefresh?: () => void
}> = ({ status, orderId, transactionId, canRefresh, onRefresh }) => {
  const isApproved = status === 'APPROVED'
  const isDeclined = status === 'DECLINED' || status === 'VOIDED' || status === 'ERROR'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] px-4 pt-24 md:pt-36">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
        {isApproved ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#333333] mb-2">¡Pago aprobado!</h1>
            <p className="text-gray-500 text-sm mb-6">
              Tu orden fue confirmada y está siendo procesada.
            </p>

            <div className="bg-[#F2F2F2] rounded-2xl px-5 py-4 mb-6 text-left space-y-3">
              {transactionId && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Referencia ePayco</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-bold text-[#333333] break-all">{transactionId}</p>
                    <CopyButton value={transactionId} />
                  </div>
                </div>
              )}
              {orderId && (
                <div className={transactionId ? 'border-t border-gray-200 pt-3' : ''}>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">ID de orden</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-bold text-[#333333]">#{orderId.slice(0, 8).toUpperCase()}</p>
                    <CopyButton value={orderId} />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : isDeclined ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#333333] mb-3">Pago rechazado</h1>
            <p className="text-gray-500 mb-8">
              Tu pago no fue procesado. Intenta nuevamente con otro método de pago.
            </p>
            {(orderId || transactionId) && (
              <div className="bg-[#F2F2F2] rounded-2xl px-5 py-4 mb-6 text-left space-y-2">
                {transactionId && <p className="font-mono text-xs text-gray-500">Ref: {transactionId}</p>}
                {orderId && <p className="font-mono text-xs text-gray-500">Orden: #{orderId.slice(0,8).toUpperCase()}</p>}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="text-yellow-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#333333] mb-3">Pago pendiente</h1>
            <p className="text-gray-500 mb-4">
              Tu pago está siendo procesado. Actualizaremos el estado de tu orden una vez confirmado.
            </p>
            {canRefresh && (
              <button
                onClick={onRefresh}
                className="mb-4 flex items-center justify-center gap-2 w-full border border-[#8DBF2E] text-[#8DBF2E] hover:bg-[#8DBF2E]/10 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Verificar de nuevo
              </button>
            )}
            {(orderId || transactionId) && (
              <div className="bg-[#F2F2F2] rounded-2xl px-5 py-4 mb-6 text-left space-y-2">
                {transactionId && (
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-gray-500">Ref: {transactionId}</p>
                    <CopyButton value={transactionId} />
                  </div>
                )}
                {orderId && (
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-gray-500">Orden: #{orderId.slice(0,8).toUpperCase()}</p>
                    <CopyButton value={orderId} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard?new=1"
            className="flex items-center justify-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <LayoutDashboard size={16} />
            Ver mis órdenes
          </Link>
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#333333] text-sm font-medium"
          >
            Seguir comprando <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSuccess
