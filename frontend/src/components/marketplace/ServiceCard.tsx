import React, { useState } from 'react'
import { ShoppingCart, Eye, CheckCircle } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { CategoryBadge } from '../ui/Badge'
import type { Service } from '../../types'
import ServiceDetailModal from './ServiceDetailModal'

interface ServiceCardProps {
  service: Service
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { addItem, openCart } = useCartStore()
  const [added, setAdded] = useState(false)
  const [showDetail, setShowDetail] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    addItem(service)
    openCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#8DBF2E]/30 cursor-pointer flex flex-col"
        onClick={() => setShowDetail(true)}
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#A6CE39]/10 to-[#4F7F1F]/10 overflow-hidden flex-shrink-0">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#8DBF2E]/20 flex items-center justify-center">
                <ShoppingCart size={28} className="text-[#6FA12A]" />
              </div>
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <CategoryBadge category={service.category} />
          </div>
          {/* View icon overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
              <Eye size={18} className="text-[#333333]" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-[#333333] mb-2 line-clamp-1 group-hover:text-[#6FA12A] transition-colors">
            {service.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{service.description}</p>

          {/* Features preview */}
          {service.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {service.features.slice(0, 2).map((f) => (
                <span
                  key={f}
                  className="text-xs bg-[#F2F2F2] text-gray-600 px-2 py-1 rounded-lg"
                >
                  {f}
                </span>
              ))}
              {service.features.length > 2 && (
                <span className="text-xs text-gray-400">+{service.features.length - 2} more</span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <div className="text-xl font-extrabold text-[#8DBF2E]">
                ${service.price.toLocaleString('es-CO')}
                <span className="text-xs font-normal text-gray-400 ml-1">COP</span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                added
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#8DBF2E] hover:bg-[#6FA12A] text-white'
              }`}
            >
              {added ? (
                <>
                  <CheckCircle size={15} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ServiceDetailModal
        service={service}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onAddToCart={() => { addItem(service); openCart() }}
      />
    </>
  )
}

export default ServiceCard
