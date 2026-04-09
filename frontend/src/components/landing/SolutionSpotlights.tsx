import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const spotlights = [
  {
    tag: 'Soluciones destacadas',
    title: 'Inspección de Drilling y Workover Rigs.',
    description:
      'Garantizamos la integridad operativa de estructuras críticas a servicio de pozo bajo estrictas normas API. Realizamos evaluaciones exhaustivas en equipos de perforación y mantenimiento para asegurar una operación segura y eficiente en campo',
    image: '/assets/drillingyworkover.jpeg',
    link: '/what-we-do',
  },
  {
    tag: 'Soluciones destacadas',
    title: 'Ensayos No Destructivos (END) y Soldadura.',
    description:
      'TEvaluaciones de alta precisión mediante Ultrasonido, Partículas Magnéticas y Tintas Penetrantes para detectar discontinuidades sin afectar sus activos. Todo nuestro personal está certificado bajo estándares AWS CWI, ASNT y ASME',
    image: '/assets/endsoldaduras.jpeg',
    link: '/what-we-do',
  },
]

const SolutionSpotlights: React.FC = () => {
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {spotlights.map((item) => (
            <Link
              key={item.title}
              to={item.link}
              className="group relative rounded-2xl overflow-hidden h-[400px] block shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Background image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block text-[#A6CE39] text-xs font-semibold tracking-widest uppercase mb-3">
                  {item.tag}
                </span>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-[#8DBF2E] text-sm font-semibold group-hover:gap-3 transition-all">
                  Más información <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SolutionSpotlights
