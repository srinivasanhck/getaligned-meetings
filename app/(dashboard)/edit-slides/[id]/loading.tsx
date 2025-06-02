export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="h-12 w-full flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="aspect-[16/9] bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          <div className="w-16 md:w-20 bg-white border-l border-gray-200">
            <div className="flex flex-col items-center gap-6 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-14 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 p-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-14 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
