"use client"

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function ExamplePrompts({ onSelectPrompt }: ExamplePromptsProps) {
  const examplePrompts = [
    {
      text: "Redefining Office Productivity with AIGC",
    },
    {
      text: "How to Increase Employee Engagement",
    },
    {
      text: "Future Trends in Virtual Currencies",
    },
    {
      text: "Key Strategies for Remote Team Collaboration",
    },
    {
      text: "Leadership Skills for Managers",
    },
    {
      text: "Building an Effective Sales Team",
    },
    {
      text: "What is quantum physics?",
    },
  ]

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full text-sm border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
            onClick={() => onSelectPrompt(prompt.text)}
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  )
}
