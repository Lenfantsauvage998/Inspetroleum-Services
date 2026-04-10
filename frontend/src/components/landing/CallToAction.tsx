import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const CallToAction: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Big CTA */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#4F7F1F] to-[#8DBF2E] p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Optimice sus recursos con excelencia técnica !
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
              En Industrial Services GF SAS, brindamos soluciones orientadas a preservar sus activos y asegurar un ambiente de trabajo sano y seguro mediante procedimientos actualizados y personal altamente calificado
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-3 bg-white text-[#4F7F1F] font-bold text-lg px-8 py-4 rounded-xl hover:bg-[#F2F2F2] transition-colors shadow-xl"
            >
              Explora nuestros servicios
              <ArrowRight size={20} />
            </Link>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
      </div>
    </section>
  )
}

export default CallToAction
