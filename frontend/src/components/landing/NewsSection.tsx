import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'

const articles = [
  {
    category: 'Petróleo',
    date: 'Marzo 2021',
    title: 'Inspección de Rigs y Tubería',
    excerpt:
      'Certificación técnica de estructuras Drilling y Workover bajo estrictas normas API para asegurar la continuidad operativa en campo',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  },
  {
    category: 'Soldadura',
    date: 'February 2025',
    title: 'Ensayos No Destructivos (END)',
    excerpt:
      'Diagnóstico avanzado mediante Ultrasonido, Partículas Magnéticas y Tintas Penetrantes realizado por inspectores certificados AWS CWI',
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80',
  },
  {
    category: 'Izaje',
    date: 'Servicios Permanentes',
    title: 'Evaluación técnica y de seguridad para grúas, montacargas y manlifts bajo normatividad internacional ANSI Serie B30 y ASTM',
    excerpt:
      'Strategic expansion into Caribbean markets positions us as the leading LNG solutions provider for the entire northern South America region.',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&q=80',
  },
  {
    category: 'Formación',
    date: 'December 2024',
    title: 'Calificación de Personal',
    excerpt:
      'Validación de competencias técnicas y certificación de personal bajo esquemas internacionales ASNT, AWS y ASME ',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
  },
]

const NewsSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[#8DBF2E]" />
              <span className="text-[#8DBF2E] text-sm font-semibold tracking-widest uppercase">
                Excelencia en Inspección Técnica Industrial
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Garantizando la Integridad y<br/>Seguridad de su Infraestructura
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#8DBF2E] hover:text-[#A6CE39] transition-colors"
          >
            Ver Todo<ArrowRight size={14} />
          </a>
        </div>

        {/* Cards horizontal scroll on mobile, 4-col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden border border-white/10 hover:border-[#8DBF2E]/50 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute top-3 left-3 bg-[#8DBF2E] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                  <Calendar size={12} />
                  {article.date}
                </div>
                <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1 text-[#8DBF2E] text-xs font-semibold group-hover:gap-2 transition-all">
                  Read More <ArrowRight size={12} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewsSection
