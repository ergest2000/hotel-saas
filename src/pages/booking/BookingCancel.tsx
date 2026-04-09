import { useNavigate } from 'react-router-dom'

export default function BookingCancel() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Pagesa u anulua</h1>
        <p className="text-gray-500 mb-6 text-sm">Rezervimi nuk u kompletua. Mund të provosh përsëri.</p>
        <button onClick={() => navigate('/booking')}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          Provo përsëri
        </button>
      </div>
    </div>
  )
}
