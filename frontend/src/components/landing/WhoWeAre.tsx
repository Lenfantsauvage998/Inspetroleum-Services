import React from 'react'
import { ArrowRight, Award, Globe, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const WhoWeAre: React.FC = () => {
  return (
    <section id="who-we-are" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-10 bg-[#8DBF2E]" />
              <span className="text-[#8DBF2E] text-sm font-semibold tracking-widest uppercase">¿Quiénes somos?</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold text-[#333333] leading-tight mb-6">
              Industrial Services GF SAS 
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              Es una empresa colombiana líder en inspección y certificación de soldaduras, equipos de izaje y herramientas para la industria petrolera y general
              . Brindamos soluciones de excelencia diseñadas para optimizar sus recursos y asegurar la ejecución efectiva de sus proyectos

            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Nuestra misión es actuar como un aliado estratégico que permite a nuestros clientes optimizar y preservar sus recursos, asegurando una ejecución efectiva de sus proyectos mediante el cumplimiento estricto de normativas internacionales como API, AWS, ASTM, ASME, DS-1 y ANSI
              . Para ello, contamos con un equipo de personal altamente calificado y certificado bajo estándares ASNT, AWS y ASME, lo que respalda la calidad y precisión de cada uno de nuestros diagnósticos

            </p>
          </div>

          {/* Right: Image + stats */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/newone.jpg"
                alt="Industrial Services GF team at work"
                className="w-full h-auto block"
              />
              {/* Green overlay strip */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4F7F1F] via-[#8DBF2E] to-[#A6CE39]" />
            </div>

            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-5 grid grid-cols-3 gap-4 border border-gray-100">
              {[
                { icon: <Award className="text-[#8DBF2E]" size={18} />, value: '1000+', label: 'Servicios' },
                { icon: <Globe className="text-[#8DBF2E]" size={18} />, value: '3+', label: 'Paises' },
                { icon: <Zap className="text-[#8DBF2E]" size={18} />, value: '20+', label: 'años' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <div className="font-extrabold text-[#333333] text-lg leading-none">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Green accent square */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#8DBF2E]/10 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhoWeAre
