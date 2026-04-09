import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const NotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F2F2] px-4 pt-24 md:pt-36">
    <div className="text-center">
      <div className="text-9xl font-extrabold text-[#8DBF2E] mb-4">404</div>
      <h1 className="text-3xl font-bold text-[#333333] mb-3">Page not found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-[#8DBF2E] hover:bg-[#6FA12A] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>
    </div>
  </div>
)

export default NotFound
