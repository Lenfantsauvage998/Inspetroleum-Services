import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Briefcase, Star } from 'lucide-react'

const cards = [
  {
    icon: <Briefcase size={24} className="text-[#8DBF2E]" />,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
    title: 'Sector Petrolero',
    description: 'Certificación técnica de Drilling y Workover Rigs bajo normas API para garantizar la seguridad y efectividad en campo',
    link: '#',
    cta: 'Explore',
  },
  {
    icon: <Star size={24} className="text-[#8DBF2E]" />,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80',
    title: 'Soldadura y END',
    description: 'Evaluación de precisión mediante ultrasonido, partículas magnéticas y tintas penetrantes por inspectores certificados AWS CWI',
    link: '#',
    cta: 'Discover',
  },
  {
    icon: <Users size={24} className="text-[#8DBF2E]" />,
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
    title: 'Izaje de Carga',
    description: 'Inspección técnica de grúas, montacargas y manlifts bajo normatividad ANSI Serie B30 y ASTM para prevenir riesgos operativos',
    link: '#',
    cta: 'Read More',
  },
]

const CallToAction: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#8DBF2E]" />
            <span className="text-[#8DBF2E] text-sm font-semibold tracking-widest uppercase">Explora Mas</span>
          </div>
          <h2 className="text-4xl font-extrabold text-[#333333]">Nuestras Áreas de Especialidad</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {cards.map((card) => (
            <a
              key={card.title}
              href={card.link}
              className="group relative rounded-2xl overflow-hidden h-64 block shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">{card.description}</p>
                <div className="flex items-center gap-1 text-[#8DBF2E] text-sm font-semibold">
                  {card.cta} <ArrowRight size={13} />
                </div>
              </div>
            </a>
          ))}
        </div>

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
