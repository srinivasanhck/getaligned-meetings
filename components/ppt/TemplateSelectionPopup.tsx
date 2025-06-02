"use client"

interface TemplateSelectionPopupProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: string) => void
  selectedTemplate: string
}

export function TemplateSelectionPopup({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplate,
}: TemplateSelectionPopupProps) {
  if (!isOpen) return null

  const handleSelectTemplate = (template: string) => {
    onSelectTemplate(template)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choose Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Light Theme */}
          <div
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === "light" ? "border-purple-500 shadow-md" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectTemplate("light")}
          >
            <div className="bg-gray-100 p-3 border-b border-gray-200">
              <h3 className="font-medium">Light Theme</h3>
            </div>
            <div className="p-4 bg-white">
              <div className="w-full aspect-video bg-white border border-gray-200 rounded mb-3">
                <div className="w-1/3 h-2 bg-purple-500 rounded mt-3 ml-3"></div>
                <div className="w-2/3 h-1 bg-gray-200 rounded mt-2 ml-3"></div>
                <div className="w-1/2 h-1 bg-gray-200 rounded mt-1 ml-3"></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              </div>
            </div>
          </div>

          {/* Dark Theme */}
          <div
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === "dark" ? "border-purple-500 shadow-md" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectTemplate("dark")}
          >
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="font-medium text-white">Dark Theme</h3>
            </div>
            <div className="p-4 bg-gray-900">
              <div className="w-full aspect-video bg-gray-800 border border-gray-700 rounded mb-3">
                <div className="w-1/3 h-2 bg-purple-400 rounded mt-3 ml-3"></div>
                <div className="w-2/3 h-1 bg-gray-600 rounded mt-2 ml-3"></div>
                <div className="w-1/2 h-1 bg-gray-600 rounded mt-1 ml-3"></div>
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                <div className="w-2 h-2 rounded-full bg-gray-600"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
