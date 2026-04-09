import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Share2 } from 'lucide-react'

const Footer: React.FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#333333] text-[#F2F2F2]">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/assets/Logo-removebg-preview.png"
                alt="Industrial Services GF"
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
               Especialistas en servicios de inspección y certificación de soldaduras, equipos de izaje y herramientas para la industria petrolera y general, operando bajo los más estrictos estándares internacionales como API, AWS y ASME
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#8DBF2E] transition-colors" aria-label="LinkedIn">
                <Globe size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#8DBF2E] transition-colors" aria-label="Twitter/X">
                <Share2 size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#8DBF2E] transition-colors" aria-label="Facebook">
                <Globe size={15} />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#8DBF2E] transition-colors" aria-label="Instagram">
                <Share2 size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link to="/marketplace?category=OILFIELD_SERVICES" className="hover:text-[#8DBF2E] transition-colors">
                  INSPECCIÓN PETROLERA
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=LNG" className="hover:text-[#8DBF2E] transition-colors">
                  SOLDADURA Y END
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=INDUSTRIAL_TECH" className="hover:text-[#8DBF2E] transition-colors">
                  EQUIPOS DE IZAJE
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=ENERGY_TRANSITION" className="hover:text-[#8DBF2E] transition-colors">
                  CALIFICACIÓN DE PERSONAL
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-[#8DBF2E] transition-colors">
                  Revisa todos los servicios
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">EMPRESA</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="/#who-we-are" className="hover:text-[#8DBF2E] transition-colors">Acerca de nosotros</a></li>
              <li><a href="/#what-we-do" className="hover:text-[#8DBF2E] transition-colors">¿Qué hacemos?</a></li>
              <li><a href="/#solutions" className="hover:text-[#8DBF2E] transition-colors">Soluciones</a></li>
              <li><Link to="/dashboard" className="hover:text-[#8DBF2E] transition-colors">Portal del cliente</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-[#8DBF2E] mt-0.5 flex-shrink-0" />
                <span>Calle 22 No. 13-77 Int 18<br />Chía, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-[#8DBF2E] flex-shrink-0" />
                <a href="tel:+573001234567" className="hover:text-[#8DBF2E] transition-colors">
                  +57 315 575 3581 / (091) 8851876
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-[#8DBF2E] flex-shrink-0" />
                <a href="mailto:contact@industrialservicesgf.com" className="hover:text-[#8DBF2E] transition-colors">
                  industrialservicesgf@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {year} Industrial Services GF. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-[#8DBF2E] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#8DBF2E] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#8DBF2E] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
