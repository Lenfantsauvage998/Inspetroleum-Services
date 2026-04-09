import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RadioTower, Flame, Forklift, GraduationCap, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react'
import type { Category } from '../types'

interface Tab {
  id: Category
  label: string
  icon: React.ReactNode
  description: string
  features: string[]
  image: string
  badge: string
}

const tabs: Tab[] = [
  {
    id: 'OILFIELD_SERVICES',
    label: 'Inspección Petrolera e Industrial',
    icon: <RadioTower size={20} />,
    badge: 'Petróleo & Gas',
    description:
      'Inspeccion y Certificación de herramientas y equipos para la industria del petróleo y el sector industrial . Incluye la inspección de estructuras a servicio de pozo como Drilling y Workover Rigs bajo estrictas normas API',
    features: [
      'Inspección de estructuras a servicio de pozo (Drilling & Workover Rigs)',
      'Inspección de tubería (Casing , Drill Pipe , Tuberia de produccion)',
      'Ensayos No Destructivos (END) en general',
      'Inspección de herramientas y equipos industriales',
    ],
    image: '/assets/drillingyworkover.jpeg',
  },
  {
    id: 'LNG',
    label: 'Inspeccion de Soldaduras ',
    icon: <Flame size={20} />,
    badge: 'Soldadura',
    description:
      'Inspeccion de soldaduras con ensayos no destructivos (VT) Visual, (MT) Particulas magneticas, (PT) Tintas penetrantes, (UT) Ultrasonido',
    features: [
      'Inspecciones realizadas por personal calificado ',
      'Ensayos No Destructivos: Ultrasonido, Partículas Magnéticas y Tintas Penetrantes',
      'Verificación de integridad de soldaduras bajo normativa internacional',
    ],
    image: '/assets/endsoldaduras.jpeg',
  },
  {
    id: 'INDUSTRIAL_TECH',
    label: 'Equipos de Izaje',
    icon: <Forklift size={20} />,
    badge: 'Izaje',
    description:
      'Inspección y certificación técnica de grúas, montacargas y manlifts cumpliendo con la normatividad ANSI Serie B30 y ASTM. Brindamos soluciones orientadas a la excelencia para optimizar sus recursos y garantizar un ambiente operativo sano y seguro.',
    features: [
      'Certificación técnica de Grúas, Montacargas y Manlifts',
      'Evaluación bajo normas internacionales ANSI B30 y ASTM',
      'Prevención de riesgos operativos y preservación de activos industriales',
      'Informes técnicos detallados con recomendaciones de mantenimiento',
    ],
    image: 'assets/izaje.jpeg',
  },
  {
    id: 'ENERGY_TRANSITION',
    label: 'Calificación de Personal',
    icon: <GraduationCap size={20} />,
    badge: 'Formación',
    description:
      'Ofrecemos servicios especializados de calificación y certificación de personal en técnicas de Ensayos No Destructivos (END) para asegurar que sus equipos humanos cumplan con los más altos estándares de la industria. Validamos las competencias técnicas bajo esquemas internacionales como ASNT, AWS CWI y ASME.',
    features: [
      'Certificación de personal técnico en Ensayos No Destructivos (END)',
      'Calificación de soldadores y personal bajo normativas AWS y ASME',
      'Validación de competencias técnicas bajo estándares ASNT y AWS CWI',
      'Garantía de un ambiente de trabajo seguro y profesional en cada proyecto',
    ],
    image: 'assets/Capacitaciones.jpeg',
  },
]

const WhatWeDoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('OILFIELD_SERVICES')
  const current = tabs.find((t) => t.id === activeTab)!

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return (
    <div className="min-h-screen bg-[#F2F2F2]">

      {/* Hero Banner */}
      <div className="bg-[#333333] text-white pt-24 md:pt-36 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[#8DBF2E] transition-colors">Inicio</Link>
            <ChevronRight size={14} />
            <span className="text-[#8DBF2E]">¿Qué hacemos?</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#8DBF2E]" />
            <span className="text-[#8DBF2E] text-sm font-semibold tracking-widest uppercase">Nuestras Soluciones</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
            Soluciones integrales para <br className="hidden md:block" />
            <span className="text-[#8DBF2E]">todo el sector industrial</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Expertos en inspección técnica, certificación y calificación de personal bajo las normativas internacionales más exigentes: API, AWS, ASME, ANSI y ASTM.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Tab navigation */}
        <div className="flex flex-wrap gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                activeTab === tab.id
                  ? 'bg-[#8DBF2E] border-[#8DBF2E] text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-[#8DBF2E] hover:text-[#8DBF2E]'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.badge}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12">
          {/* Left: Info */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#8DBF2E] bg-[#8DBF2E]/10 px-3 py-1 rounded-full mb-4">
              {current.badge}
            </span>
            <h2 className="text-3xl font-extrabold text-[#333333] mb-4 leading-tight">{current.label}</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{current.description}</p>

            <ul className="space-y-3 mb-10">
              {current.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle2 size={17} className="text-[#8DBF2E] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#333333]">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl h-80 lg:h-[420px]">
              <img
                key={current.id}
                src={current.image}
                alt={current.label}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>

        {/* All areas summary cards */}
        <div className="mt-16">
          <h3 className="text-2xl font-extrabold text-[#333333] mb-8">Todas nuestras áreas de servicio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`text-left p-6 rounded-2xl border-2 transition-all group ${
                  activeTab === tab.id
                    ? 'border-[#8DBF2E] bg-[#8DBF2E]/5'
                    : 'border-gray-200 bg-white hover:border-[#8DBF2E]/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  activeTab === tab.id ? 'bg-[#8DBF2E] text-white' : 'bg-[#F2F2F2] text-gray-500 group-hover:bg-[#8DBF2E]/10 group-hover:text-[#8DBF2E]'
                }`}>
                  {tab.icon}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#8DBF2E] block mb-2">{tab.badge}</span>
                <h4 className="font-bold text-[#333333] text-sm leading-snug mb-2">{tab.label}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{tab.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-[#333333] rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold text-white mb-2">¿Listo para optimizar su operación?</h3>
            <p className="text-gray-400 text-sm">Explore nuestro catálogo completo y solicite el producto que necesita.</p>
          </div>
          <Link
            to="/marketplace"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-bold px-8 py-4 rounded-xl transition-colors group"
          >
            Ver todos los productos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WhatWeDoPage
