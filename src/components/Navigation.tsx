import { Link } from 'react-router-dom'
import { DollarSign } from 'lucide-react'

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              to="/submit"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Submit Product
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
