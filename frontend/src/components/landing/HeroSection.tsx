import React from 'react'
import { ChevronDown } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/assets/wmremove-transformed.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Animated accent lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-96 h-px bg-gradient-to-r from-transparent via-[#8DBF2E]/50 to-transparent"
          style={{ transform: 'rotate(-15deg)' }}
        />
        <div
          className="absolute top-2/3 -right-20 w-96 h-px bg-gradient-to-r from-transparent via-[#A6CE39]/40 to-transparent"
          style={{ transform: 'rotate(-15deg)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-3xl">


          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6">
            Calidad y servicio{' '}
            <span
              className="relative inline-block"
              style={{ WebkitTextStroke: '2px #8DBF2E', color: 'transparent' }}
            >
              Nuestra mejores cartas de 
            </span>{' '}
            <span className="text-[#8DBF2E]">presentación</span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
            Expertos en inspección técnica y certificación bajo normas API, AWS y ASME
            . Garantizamos la seguridad y ejecución efectiva de su operación industrial
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => document.getElementById('who-we-are')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <span className="text-xs uppercase tracking-widest">Desplazar</span>
        <ChevronDown size={16} className="animate-bounce" />
      </button>
    </section>
  )
}

export default HeroSection
