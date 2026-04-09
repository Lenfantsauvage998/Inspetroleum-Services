import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Drill, Waves, Cpu, Leaf, CheckCircle2, ArrowRight } from 'lucide-react'
import type { Category } from '../../types'

interface Tab {
  id: Category
  label: string
  icon: React.ReactNode
  description: string
  features: string[]
  image: string
}

const tabs: Tab[] = [
  {
    id: 'OILFIELD_SERVICES',
    label: 'Inspección Petrolera e Industrial',
    icon: <Drill size={18} />,
    description:
      'Inspeccion y Certificación de herramientas y equipos para la industria del petróleo y el sector industrial . Incluye la inspección de estructuras a servicio de pozo como Drilling y Workover Rigs bajo estrictas normas API',
    features: [
      'Inspección de estructuras a servicio de pozo:',
      'Inspección de tubería especializada',
      'Ensayos No Destructivos (END):',
    ],
    image: '/assets/land1.png',
  },
  {
    id: 'LNG',
    label: 'Soldadura y ENDs',
    icon: <Waves size={18} />,
    description:
      ' Diagnósticos de alta precisión mediante técnicas de Ultrasonido, Partículas Magnéticas y Tintas Penetrantes para detectar discontinuidades. Nuestro personal certificado AWS CWI garantiza la integridad de soldaduras bajo estándares globales AWS, ASME y API ',
    features: [
      'Inspecciones realizadas por personal calificado AWS CWI, ASNT y ASME',
      'Ensayos No Destructivos: Ultrasonido, Partículas y Tintas Penetrantes',
      'Calificación y certificación de personal en ensayos especializados',
    ],
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80',
  },
  {
    id: 'INDUSTRIAL_TECH',
    label: 'Equipos de Izaje  ',
    icon: <Cpu size={18} />,
    description:
      'Inspección y certificación técnica de grúas, montacargas y manlifts cumpliendo con la normatividad ANSI Serie B30 y ASTMrindamos soluciones orientadas a la excelencia para optimizar sus recursos y garantizar un ambiente operativo sano y seguro',
    features: [
      'Certificación técnica de Grúas, Montacargas y Manlifts',
      'Evaluación bajo normas internacionales ANSI B30 y ASTM',
      'Prevención de riesgos operativos y preservación de activos industriales',
    ],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  },
  {
    id: 'ENERGY_TRANSITION',
    label: 'Prevención de riesgos operativos',
    icon: <Leaf size={18} />,
    description:
      'Ofrecemos servicios especializados de calificación y certificación de personal en técnicas de Ensayos No Destructivos (END) para asegurar que sus equipos humanos cumplan con los más altos estándares de la industria. Validamos las competencias técnicas bajo esquemas internacionales como ASNT, AWS CWI y ASME, garantizando una operación segura, profesional y altamente calificada en cada proyecto',
    features: [
      'Certificación de personal técnico en Ensayos No Destructivos (END)',
      'Calificación de soldadores y personal bajo normativas AWS y ASME',
      'Validación de competencias técnicas para asegurar un ambiente de trabajo seguro',
    ],
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=80',
  },
]

const WhatWeDo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('OILFIELD_SERVICES')
  const current = tabs.find((t) => t.id === activeTab)!

  return (
    <section id="what-we-do" className="py-24 bg-[#F2F2F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#8DBF2E]" />
            <span className="text-[#8DBF2E] text-sm font-semibold tracking-widest uppercase">¿Qué hacemos?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#333333] max-w-2xl leading-tight">
            Soluciones integrales para todo el sector industrial.
          </h2>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-0 border-b border-gray-300 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#8DBF2E]'
                  : 'text-gray-500 hover:text-[#333333]'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {/* Active indicator */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-[#8DBF2E] transition-all duration-300 ${
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h3 className="text-2xl font-bold text-[#333333] mb-4">{current.label}</h3>
            <p className="text-gray-600 leading-relaxed mb-6">{current.description}</p>

            <ul className="space-y-3 mb-8">
              {current.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#8DBF2E] flex-shrink-0" />
                  <span className="text-sm text-[#333333]">{feat}</span>
                </li>
              ))}
            </ul>

            <Link
              to={`/marketplace?category=${current.id}`}
              className="inline-flex items-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-semibold px-6 py-3 rounded-xl transition-colors group"
            >
              View Services
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl h-80 lg:h-96">
              <img
                key={current.id}
                src={current.image}
                alt={current.label}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhatWeDo
