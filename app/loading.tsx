export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gunworx Management Portal</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
