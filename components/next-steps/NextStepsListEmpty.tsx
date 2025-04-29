import { Card, CardContent } from "@/components/ui/card"

export default function NextStepsListEmpty() {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Next Steps</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-gray-100 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-medium">No next steps found</h2>
          <p className="text-gray-500">There are no next steps available for the selected time period.</p>
        </CardContent>
      </Card>
    </div>
  )
}
