import React, { useState } from 'react'
import { CheckCircle2, ShoppingCart, Tag, ChevronLeft, ChevronRight } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { CategoryBadge } from '../ui/Badge'
import { CATEGORY_LABELS } from '../../types'
import type { Service } from '../../types'

interface Props {
  service: Service
  isOpen: boolean
  onClose: () => void
  onAddToCart: () => void
}

const ServiceDetailModal: React.FC<Props> = ({ service, isOpen, onClose, onAddToCart }) => {
  const [imgIndex, setImgIndex] = useState(0)

  const allImages = [service.image_url, ...(service.image_urls ?? [])].filter(Boolean) as string[]
  const hasMultiple = allImages.length > 1

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex(i => (i - 1 + allImages.length) % allImages.length)
  }
  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIndex(i => (i + 1) % allImages.length)
  }

  const handleAdd = () => {
    onAddToCart()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A6CE39]/20 to-[#4F7F1F]/20 flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={22} className="text-[#6FA12A]" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <CategoryBadge category={service.category} />
            </div>
            <h2 className="text-xl font-bold text-[#333333]">{service.title}</h2>
            <p className="text-sm text-gray-500">{CATEGORY_LABELS[service.category]}</p>
          </div>
        </div>

        {/* Image carousel */}
        {allImages.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden bg-gray-50">
            <img
              src={allImages[imgIndex]}
              alt={`${service.title} ${imgIndex + 1}`}
              className="w-full h-auto block"
            />

            {hasMultiple && (
              <>
                {/* Prev / Next */}
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-xs font-medium">
                  {imgIndex + 1} / {allImages.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-[#333333] mb-2">Overview</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
        </div>

        {/* Features */}
        {service.features.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-[#333333] mb-3">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-[#8DBF2E] flex-shrink-0" />
                  <span className="text-sm text-[#333333]">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-[#F2F2F2] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
              <Tag size={11} />
              Service Price
            </div>
            <div className="text-2xl font-extrabold text-[#8DBF2E]">
              ${service.price.toLocaleString('es-CO')}
              <span className="text-sm font-normal text-gray-500 ml-1">COP</span>
            </div>
          </div>
          <Button onClick={handleAdd} size="lg">
            <ShoppingCart size={16} />
            Add to Cart
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ServiceDetailModal
