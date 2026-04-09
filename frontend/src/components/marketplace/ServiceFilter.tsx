import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'
import { useCategories } from '../../hooks/useAdminData'
import type { Category } from '../../types'

interface FilterState {
  category: Category | ''
  minPrice: string
  maxPrice: string
}

interface ServiceFilterProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const ServiceFilter: React.FC<ServiceFilterProps> = ({ filters, onChange }) => {
  const { data: categories = [] } = useCategories()
  const activeCategories = categories.filter((c) => c.is_active)

  const setCategory = (cat: Category | '') => onChange({ ...filters, category: cat })
  const reset = () => onChange({ category: '', minPrice: '', maxPrice: '' })
  const hasFilters = filters.category || filters.minPrice || filters.maxPrice

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#8DBF2E]" />
          <h3 className="font-semibold text-[#333333] text-sm">Filtros</h3>
        </div>
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#8DBF2E] transition-colors"
          >
            <RotateCcw size={11} />
            Borrar
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Categoria</h4>
        <div className="space-y-2">
          <button
            onClick={() => setCategory('')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
              !filters.category
                ? 'bg-[#8DBF2E] text-white font-semibold'
                : 'text-gray-600 hover:bg-[#F2F2F2]'
            }`}
          >
            Todos los productos
          </button>
          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                filters.category === cat.id
                  ? 'bg-[#8DBF2E] text-white font-semibold'
                  : 'text-gray-600 hover:bg-[#F2F2F2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Rango de precio (COP)</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Min Precio</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#8DBF2E] focus:ring-1 focus:ring-[#8DBF2E]/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Max Precio</label>
            <input
              type="number"
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#8DBF2E] focus:ring-1 focus:ring-[#8DBF2E]/20 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceFilter
