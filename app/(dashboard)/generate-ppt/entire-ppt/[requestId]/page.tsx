import { EditorProvider } from "@/components/rich-text/editor-context"
import SlideEditorWrapper from "@/components/slide-editor/slide-editor-wrapper"

interface PageProps {
  params: Promise<{ requestId: string }>
}

export default async function EntirePPTPage({ params }: PageProps) {
  const { requestId } = await params

  return (
    <EditorProvider>
      <main className="min-h-screen">
        <SlideEditorWrapper requestId={requestId} />
      </main>
    </EditorProvider>
  )
}
