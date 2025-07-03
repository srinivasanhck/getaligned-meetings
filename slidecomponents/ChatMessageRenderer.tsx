import type React from "react"

interface ChatMessageRendererProps {
  content: string
  className?: string
}

const ChatMessageRenderer: React.FC<ChatMessageRendererProps> = ({ content, className = "" }) => {
  // Simple markdown-like formatting for chat messages
  const formatMessage = (text: string) => {
    // Split by double line breaks for paragraphs
    const paragraphs = text.split("\n\n")

    return paragraphs.map((paragraph, pIndex) => {
      // Handle bullet points
      if (paragraph.includes("*   ") || paragraph.includes("•   ")) {
        const lines = paragraph.split("\n")
        const listItems = lines.filter((line) => line.trim().startsWith("*   ") || line.trim().startsWith("•   "))
        const otherLines = lines.filter((line) => !line.trim().startsWith("*   ") && !line.trim().startsWith("•   "))

        return (
          <div key={pIndex} className="mb-3">
            {otherLines.length > 0 && (
              <div className="mb-2">
                {otherLines.map((line, lIndex) => (
                  <div key={lIndex} dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
                ))}
              </div>
            )}
            {listItems.length > 0 && (
              <ul className="list-disc list-inside space-y-1 ml-2">
                {listItems.map((item, iIndex) => (
                  <li key={iIndex} className="text-sm">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: formatInlineText(item.replace(/^\s*[*•]\s*/, "")),
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(paragraph.trim())) {
        const lines = paragraph.split("\n")
        const listItems = lines.filter((line) => /^\s*\d+\.\s/.test(line))
        const otherLines = lines.filter((line) => !/^\s*\d+\.\s/.test(line))

        return (
          <div key={pIndex} className="mb-3">
            {otherLines.length > 0 && (
              <div className="mb-2">
                {otherLines.map((line, lIndex) => (
                  <div key={lIndex} dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
                ))}
              </div>
            )}
            {listItems.length > 0 && (
              <ol className="list-decimal list-inside space-y-1 ml-2">
                {listItems.map((item, iIndex) => (
                  <li key={iIndex} className="text-sm">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: formatInlineText(item.replace(/^\s*\d+\.\s*/, "")),
                      }}
                    />
                  </li>
                ))}
              </ol>
            )}
          </div>
        )
      }

      // Regular paragraph
      return (
        <div key={pIndex} className="mb-3">
          {paragraph.split("\n").map((line, lIndex) => (
            <div key={lIndex} dangerouslySetInnerHTML={{ __html: formatInlineText(line) }} />
          ))}
        </div>
      )
    })
  }

  const formatInlineText = (text: string) => {
    return (
      text
        // Bold text **text** or ***text***
        .replace(/\*\*\*(.*?)\*\*\*/g, "<strong>$1</strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Italic text *text*
        .replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, "<em>$1</em>")
        // Code `text`
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-xs">$1</code>')
        // Line breaks
        .replace(/\n/g, "<br />")
    )
  }

  return <div className={className}>{formatMessage(content)}</div>
}

export default ChatMessageRenderer
