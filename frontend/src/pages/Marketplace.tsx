import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useServices } from '../hooks/useServices'
import ServiceCard from '../components/marketplace/ServiceCard'
import ServiceFilter from '../components/marketplace/ServiceFilter'
import Spinner from '../components/ui/Spinner'
import type { Category } from '../types'

interface PriceFilters {
  minPrice: string
  maxPrice: string
}

interface Filters {
  category: Category | ''
  minPrice: string
  maxPrice: string
}

const Marketplace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  // Category is always derived from the URL so back/forward navigation works correctly
  const category = (searchParams.get('category') as Category) || ''
  const [priceFilters, setPriceFilters] = useState<PriceFilters>({ minPrice: '', maxPrice: '' })
  const filters: Filters = { category, ...priceFilters }
  const [showFilters, setShowFilters] = useState(false)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  const handleFilterChange = (newFilters: Filters) => {
    if (newFilters.category !== category) {
      setSearchParams(newFilters.category ? { category: newFilters.category } : {}, { replace: true })
    }
    setPriceFilters({ minPrice: newFilters.minPrice, maxPrice: newFilters.maxPrice })
  }

  const { data: services = [], isLoading, error } = useServices({
    category: filters.category || undefined,
    search: search || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
  })

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Page Header */}
      <div className="bg-[#333333] text-white pt-24 md:pt-36 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-8 bg-[#8DBF2E]" />
            <span className="text-[#A6CE39] text-sm font-semibold tracking-widest uppercase">Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Nuestros Productos</h1>
          <p className="text-gray-400 max-w-2xl">
            Explora nuestro catálogo de productos de inspección y certificación técnica. Desde operaciones en campo (Drilling & Workover) hasta ensayos de integridad — encuentra la excelencia y seguridad que tu proyecto necesita.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#8DBF2E] focus:ring-2 focus:ring-[#8DBF2E]/20 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#333333] shadow-sm hover:border-[#8DBF2E] transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filters.category || filters.minPrice || filters.maxPrice) && (
              <span className="bg-[#8DBF2E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filter — hidden on mobile unless toggled */}
          <aside className={`w-60 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <ServiceFilter filters={filters} onChange={handleFilterChange} />
          </aside>

          {/* Service grid */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {isLoading ? 'Loading...' : `${services.length} service${services.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 font-medium">Failed to load services</p>
                <p className="text-gray-500 text-sm mt-1">Please try again later</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-[#F2F2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-400" />
                </div>
                <p className="font-medium text-[#333333]">No services found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marketplace
