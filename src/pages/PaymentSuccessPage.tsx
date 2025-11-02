import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ArrowLeft, Loader } from 'lucide-react'

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired'
  payment_id: string
  amount: number
  processor: string
  tier: string
  message?: string
}

export default function PaymentSuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const paymentId = urlParams.get('payment_id')
    const processor = urlParams.get('processor')
    
    if (paymentId && processor) {
      checkPaymentStatus(paymentId, processor)
    } else {
      setLoading(false)
    }
  }, [])

  const checkPaymentStatus = async (paymentId: string, processor: string) => {
    try {
      // Verify payment status with backend
      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          payment_id: paymentId,
          processor: processor
        })
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const result = await response.json();
      const data = result.data;

      setPaymentStatus({
        status: data.status,
        payment_id: data.payment_id,
        amount: data.amount,
        processor: data.processor,
        tier: data.tier,
        message: data.verified ? 'Payment verified successfully' : undefined
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'failed',
        payment_id: paymentId,
        amount: 0,
        processor: processor,
        tier: 'Unknown',
        message: error.message || 'Failed to verify payment status'
      });
      setLoading(false);
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={64} />
      case 'failed':
        return <XCircle className="text-red-600" size={64} />
      case 'pending':
        return <Clock className="text-yellow-600" size={64} />
      default:
        return <Loader className="text-blue-600 animate-spin" size={64} />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'pending':
        return 'Payment Processing...'
      default:
        return 'Loading...'
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-green-600 animate-spin mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span>
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h1>
          
          {paymentStatus?.message && (
            <p className="text-gray-600 mb-6">
              {paymentStatus.message}
            </p>
          )}
          
          {paymentStatus && paymentStatus.status === 'completed' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">Welcome to RipeLemons Premium!</h3>
                <p className="text-green-800">
                  You now have unlimited access to all premium features including advanced filters, 
                  founder profiles, and priority support.
                </p>
              </div>
              
              <div className="text-sm text-gray-600 mb-6 space-y-1">
                <p><strong>Payment ID:</strong> {paymentStatus.payment_id}</p>
                <p><strong>Processor:</strong> {paymentStatus.processor}</p>
                <p><strong>Amount:</strong> ${paymentStatus.amount}</p>
                <p><strong>Plan:</strong> {paymentStatus.tier} Tier</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Exploring
                </Link>
                <Link
                  to="/admin"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Admin Dashboard
                </Link>
              </div>
            </>
          )}
          
          {paymentStatus && paymentStatus.status === 'failed' && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Payment Failed</h3>
                <p className="text-red-800">
                  We couldn't process your payment. Please try again or contact support if the problem persists.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </Link>
                <a
                  href="mailto:support@ripelemons.com"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </>
          )}
          
          {paymentStatus && paymentStatus.status === 'pending' && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">Processing Payment</h3>
                <p className="text-yellow-800">
                  Your payment is being processed. This may take a few moments. 
                  You'll be redirected once the payment is complete.
                </p>
              </div>
              
              <p className="text-gray-600 text-sm">
                Payment ID: {paymentStatus.payment_id}
              </p>
            </>
          )}
          
          {!paymentStatus && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Missing Payment Information</h3>
                <p className="text-blue-800">
                  We couldn't find your payment details. This might happen if you accessed this page directly.
                </p>
              </div>
              
              <Link
                to="/pricing"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Pricing
              </Link>
            </>
          )}
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Payment Issues</h4>
              <p className="text-gray-600">
                If your payment failed, check your card details and try again. 
                Contact support if the issue persists.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Access Questions</h4>
              <p className="text-gray-600">
                Once payment is confirmed, you'll have instant access to all premium features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}