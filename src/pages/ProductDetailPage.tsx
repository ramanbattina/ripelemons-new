import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, ProductWithDetails } from '../lib/supabase'
import Navigation from '../components/Navigation'
import { DollarSign, TrendingUp, ExternalLink, Award, User, Calendar, ArrowLeft, LineChart } from 'lucide-react'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id))
    }
  }, [id])

  async function fetchProduct(productId: number) {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle()

      if (productError) throw productError
      if (!productData) {
        navigate('/')
        return
      }

      // Fetch related data
      const [founderRes, revenueRes, categoryRes] = await Promise.all([
        supabase.from('founders').select('*').eq('id', productData.founder_id).maybeSingle(),
        supabase.from('revenue_data').select('*').eq('product_id', productId),
        supabase.from('categories').select('*').eq('id', productData.category_id).maybeSingle()
      ])

      const revenueData = revenueRes.data || []
      const latestRevenue = revenueData.sort((a, b) => 
        new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime()
      )[0]

      let verificationTier = undefined
      if (latestRevenue) {
        const { data: tierData } = await supabase
          .from('verification_tiers')
          .select('*')
          .eq('id', latestRevenue.verification_tier_id)
          .maybeSingle()
        verificationTier = tierData || undefined
      }

      setProduct({
        ...productData,
        founder: founderRes.data || undefined,
        revenue: latestRevenue,
        category: categoryRes.data || undefined,
        verification_tier: verificationTier
      })
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  function formatRevenue(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function getVerificationBadge() {
    const tier = product?.verification_tier?.tier_name || ''
    const confidence = product?.verification_tier?.confidence_level || ''
    
    if (tier.includes('Tier 1')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Verified</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    } else if (tier.includes('Tier 2')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Founder Reported</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    } else if (tier.includes('Tier 3')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Community Reported</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.category && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    {product.category.name}
                  </span>
                )}
              </div>
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Visit Website
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            <p className="text-lg text-gray-600 mb-6">
              {product.description || 'No description available'}
            </p>

            {/* Founder Info */}
            {product.founder && (
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <User className="text-gray-400" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Founder</div>
                  <div className="font-medium text-gray-900">{product.founder.name}</div>
                </div>
                <div className="flex gap-2 ml-auto">
                  {product.founder.twitter_url && (
                    <a
                      href={product.founder.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      Twitter
                    </a>
                  )}
                  {product.founder.personal_url && (
                    <a
                      href={product.founder.personal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <DollarSign size={20} />
                <span className="text-sm font-medium">Monthly Recurring Revenue</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {product.revenue?.mrr ? formatRevenue(product.revenue.mrr) : 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm font-medium">Annual Recurring Revenue</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {product.revenue?.arr ? formatRevenue(product.revenue.arr) : 'N/A'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Calendar size={20} />
                <span className="text-sm font-medium">Added to Platform</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {new Date(product.date_added).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Verification</h2>
            <div className="flex items-start gap-4">
              {getVerificationBadge()}
              <div className="flex-1">
                <p className="text-gray-600 mb-2">
                  {product.verification_tier?.description || 'No verification information available'}
                </p>
                {product.revenue?.source_url && (
                  <a
                    href={product.revenue.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    View Source
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Founder Bio */}
          {product.founder?.bio && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the Founder</h2>
              <p className="text-gray-600">{product.founder.bio}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Want to see more products like this?</h3>
            <p className="text-green-100 mb-6">
              Get premium access to advanced filters and detailed insights
            </p>
            <Link
              to="/pricing"
              className="inline-block px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
