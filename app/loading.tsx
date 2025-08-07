import { Shield } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gunworx Management Portal</h1>
        <p className="text-gray-600 mb-4">Loading application...</p>
        <div className="loading-spinner mx-auto"></div>
      </div>
    </div>
  )
}
