"use client"

import type React from "react"
import type { Slide as SlideType, SlideElement as SlideElementType } from "@/types/slide" // Updated type import
import SlideElementComponent from "./slide-element" // Renamed to avoid conflict
import { useState } from "react"
import SlideContextMenu from "./slide-context-menu"
import BackgroundDialog from "./background-dialog"

interface SlideCanvasProps {
  slide: SlideType
  currentSlideIndex: number
  selectedElementId: string | null
  setSelectedElementId: (id: string | null) => void
  updateElementPosition: (elementId: string, x: number, y: number) => void
  updateElementSize: (elementId: string, width: number, height: number) => void
  updateElementContent: (elementId: string, content: Partial<SlideElementType>) => void // Changed to partial update
  onEditingChange: (isEditing: boolean, elementId: string) => void
  deleteElement: (elementId: string) => void
  onChangeBackground: (background: string) => void
  onDuplicateSlide: () => void
  onDeleteSlide: () => void
  onEditSlideWithAI: (slideId: string) => void
  onEditElementWithAI: (slideId: string, elementId: string) => void
}




let content =
{
  "type": "complete",
  "presentation": [
    {
      "id": "slide-1750149470454-0",
      "title": "Mastering Product Sales: Strategy to Execution",
      "content": {
        "heading": "Mastering Product Sales: From Strategy to Execution",
        "subheading": "Your Blueprint for Market Domination"
      },
      "layout": "TitleSlide",
      "backgroundColor": "bg-gradient-to-br from-slate-800 to-slate-900",
      "textColor": "text-white",
      "imagePrompt": "Clean vector illustration showing a solid, structured base transitioning into a dynamic upward trajectory or growth curve, symbolizing the process from strategy to successful execution and growth in product sales. Minimalist design, professional business color scheme (e.g., blues, greens, grays).",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/6f5fdb29-9c00-4146-a379-80aa1b0bd201.png"
    },
    {
      "id": "slide-1750149486694-1",
      "title": "The Selling Challenge Today",
      "content": {
        "heading": "The Selling Challenge Today",
        "subheading": "Navigating a Complex and Evolving Landscape",
        "paragraph": "Today's market is characterized by rapid change, increased competition, and empowered customers. Businesses must adapt their selling strategies to remain effective and competitive.",
        "bulletPoints": [
          "Increased customer expectations and digital savviness.",
          "Intensified competition from global and niche players.",
          "Difficulty cutting through noise in a crowded digital space.",
          "Need for personalized and value-driven interactions.",
          "Data overload and the challenge of actionable insights."
        ],
        "iconSuggestion": "Puzzle pieces, Target with arrow, Digital maze, Handshake"
      },
      "layout": "ImageLeft",
      "backgroundColor": "bg-gradient-to-br from-sky-700 to-sky-900",
      "textColor": "text-slate-100",
      "imagePrompt": "Abstract illustration of a complex, winding path or maze with abstract obstacles, symbolizing the challenges in modern selling. Clean lines, professional business colors, minimalist vector art style.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/b4a34a17-c692-42b6-884d-a20f0649da14.png",
      "iconName": "target"
    },
    {
      "id": "slide-1750149501617-2",
      "title": "Our Framework for Success",
      "content": {
        "heading": "Our Framework for Success",
        "subheading": "An Integrated Approach to Marketing & Sales Execution",
        "paragraph": "We propose a comprehensive framework designed to drive product sales effectively. This integrated strategy connects marketing efforts directly to sales execution for measurable results.",
        "bulletPoints": [
          "Define Clear Objectives & Target Audience",
          "Develop Strategic Marketing Plan",
          "Execute Targeted Sales Activities",
          "Optimize Through Continuous Measurement"
        ],
        "iconSuggestion": "Gears / Interconnected Boxes / Flowchart"
      },
      "layout": "ImageTop",
      "backgroundColor": "bg-gradient-to-br from-indigo-700 to-indigo-900",
      "textColor": "text-neutral-50",
      "imagePrompt": "Minimalist vector illustration depicting interconnected abstract shapes forming a stable foundation and a clear upward path, symbolizing a framework for success and growth. Clean lines, professional business color palette.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/29e4a8e7-ee0f-43bc-a7e2-d5b636e8381f.png",
      "iconName": "bar-chart"
    },
    {
      "id": "slide-1750149514460-3",
      "title": "Building Demand: Marketing Strategy",
      "content": {
        "heading": "Building Demand: Marketing Strategy",
        "subheading": "Attracting Customers & Generating Leads",
        "paragraph": "A robust marketing strategy is crucial for identifying and engaging your target audience. It outlines how you will reach potential customers and convert their interest into tangible leads.",
        "bulletPoints": [
          "Define Target Audience & Ideal Customer Profile (ICP).",
          "Select Key Channels: Digital (SEO, SEM, Social Media), Content Marketing, Email Marketing, Offline (Events, PR).",
          "Develop Compelling Messaging & Value Proposition.",
          "Implement Lead Generation Tactics (e.g., landing pages, webinars, free trials).",
          "Measure & Optimize Performance (KPIs, Analytics)."
        ],
        "iconSuggestion": "Marketing funnel, target audience, megaphone, multi-channel"
      },
      "layout": "ImageRight",
      "backgroundColor": "bg-gradient-to-br from-purple-700 to-purple-900",
      "textColor": "text-white",
      "imagePrompt": "Stylized illustration of abstract shapes or blocks being strategically assembled to form an upward trend or structure, symbolizing building demand through marketing strategy. Clean, modern style with a professional color palette.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/8c8b0c7e-f42c-4c96-8434-4da197a22102.png",
      "iconName": "target"
    },
    {
      "id": "slide-1750149528548-4",
      "title": "Converting Interest: Sales Execution",
      "content": {
        "heading": "Converting Interest: Sales Execution",
        "subheading": "From Lead to Close: The Practical Steps",
        "paragraph": "Effective sales execution transforms potential leads into satisfied customers. It requires a structured process and consistent application of best practices. Mastering each stage is crucial for predictable revenue growth.",
        "bulletPoints": [
          "Lead Qualification: Identify prospects with genuine need and budget (BANT: Budget, Authority, Need, Timing). Focus effort on high-potential leads.",
          "Discovery & Needs Analysis: Deeply understand the prospect's challenges and goals. Tailor your approach to their specific situation.",
          "Solution Presentation & Demonstration: Clearly articulate how your product/service solves their problems. Focus on value and benefits, not just features.",
          "Handling Objections: Listen actively and address concerns transparently. Frame objections as opportunities to clarify value.",
          "Closing the Deal: Ask for the business confidently. Be prepared to negotiate fairly and finalize terms efficiently."
        ],
        "iconSuggestion": "Handshake, Process Flowchart, Target with Arrow"
      },
      "layout": "ImageLeft",
      "backgroundColor": "bg-gradient-to-br from-pink-700 to-pink-900",
      "textColor": "text-slate-100",
      "imagePrompt": "Clean vector illustration symbolizing the sales execution process, showing a clear flow or transformation from initial interest towards a successful outcome, abstract shapes and lines representing stages and progression, professional and modern business aesthetic, no text.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/ff3e83fb-a779-454a-a60c-f35d0c664e10.png",
      "iconName": "target"
    },
    {
      "id": "slide-1750149545071-5",
      "title": "Measuring Success & Boosting Performance",
      "content": {
        "heading": "Measuring Success & Boosting Performance",
        "subheading": "Tracking Key Metrics & Optimizing Strategies",
        "paragraph": "Effective measurement is critical for understanding what drives results. Regularly track key performance indicators (KPIs) for both marketing and sales to identify strengths and areas for improvement.",
        "dataVisualization": {
          "type": "table",
          "title": "Marketing Channel Performance Snapshot",
          "headers": [
            "Channel",
            "Leads Generated",
            "Conversion Rate (%)",
            "Cost Per Acquisition"
          ],
          "rows": [
            [
              "Social Media",
              120,
              1.5,
              "$65"
            ],
            [
              "Email Marketing",
              350,
              4.8,
              "$25"
            ],
            [
              "Paid Search",
              200,
              3.2,
              "$40"
            ],
            [
              "SEO",
              80,
              5.5,
              "$35"
            ]
          ]
        },
        "bulletPoints": [
          "Define Sales KPIs: Track metrics like Sales Cycle Length, Conversion Rate (Lead to Customer), and Average Deal Value.",
          "Define Marketing KPIs: Monitor metrics such as Website Traffic, Lead Quality, Channel ROI, and Customer Acquisition Cost (CAC).",
          "Analyze Conversion Funnels: Pinpoint where prospects drop off in the sales process to optimize each stage.",
          "Leverage Data Insights: Use performance data (like the table above) to reallocate resources to channels or strategies delivering the best ROI.",
          "Implement A/B Testing: Continuously test different messaging, offers, or channels to find what resonates best with your audience."
        ],
        "iconSuggestion": "Bar chart, speedometer, or magnifying glass"
      },
      "layout": "DataVisualizationFocus",
      "backgroundColor": "bg-gradient-to-br from-red-700 to-red-900",
      "textColor": "text-neutral-50",
      "imageUrl": null,
      "iconName": "bar-chart"
    },
    {
      "id": "slide-1750149551988-6",
      "title": "Putting it into Practice: Next Steps",
      "content": {
        "heading": "Putting it into Practice: Next Steps",
        "subheading": "Turning Strategy into Sales",
        "paragraph": "We have a clear marketing strategy. Now, it's time for decisive action and execution. Here are the immediate steps to take.",
        "bulletPoints": [
          "Develop detailed action plans for each core tactic identified.",
          "Assign clear ownership and deadlines for all initiatives.",
          "Implement tracking systems to monitor key performance indicators (KPIs).",
          "Schedule regular team reviews to assess progress and adapt.",
          "Prioritize initial quick wins to build momentum."
        ],
        "iconSuggestion": "Rocket launching or Gears turning"
      },
      "layout": "ImageRight",
      "backgroundColor": "bg-gradient-to-br from-orange-600 to-orange-800",
      "textColor": "text-white",
      "imagePrompt": "Clean, modern illustration depicting abstract elements or stylized hands assembling pieces or setting components into motion, symbolizing the act of putting plans into practice and taking next steps. Professional, optimistic color scheme, minimalist style.",
      "imageUrl": "https://s3.ap-south-1.amazonaws.com/getaligned.work/images/dfd7fae7-1a97-4afb-b8fe-a3cc0558ef40.png",
      "iconName": "rocket"
    }
  ],
  "grounding_chunks": []
}

export default function SlideCanvas({
  slide,
  currentSlideIndex,
  selectedElementId,
  setSelectedElementId,
  updateElementPosition,
  updateElementSize,
  updateElementContent,
  onEditingChange,
  deleteElement,
  onChangeBackground,
  onDuplicateSlide,
  onDeleteSlide,
  onEditSlideWithAI,
  onEditElementWithAI,
}: SlideCanvasProps) {
  const SLIDE_WIDTH = 1280
  const SLIDE_HEIGHT = 720

  const [contextMenu, setContextMenu] = useState({ isOpen: false, position: { x: 0, y: 0 } })
  const [backgroundDialogOpen, setBackgroundDialogOpen] = useState(false)

  const handleCanvasClick = () => setSelectedElementId(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY } })
  }

  const closeContextMenu = () => setContextMenu({ ...contextMenu, isOpen: false })
  const handleEditWithAI = () => {
    closeContextMenu()
    onEditSlideWithAI(slide.slide_id)
  } // Use slide_id
  const handleChangeBackgroundDialog = () => {
    closeContextMenu()
    setBackgroundDialogOpen(true)
  }
  const handleApplyBackgroundColor = (color: string) => onChangeBackground(color)
  const handleApplyBackgroundImage = (imageUrl: string) => {
    const backgroundCSS = `url('${imageUrl}') center/cover no-repeat`
    onChangeBackground(backgroundCSS)
  }
  const handleDuplicateCurrentSlide = () => {
    closeContextMenu()
    onDuplicateSlide()
  } // Renamed for clarity
  const handleDeleteCurrentSlide = () => {
    closeContextMenu()
    onDeleteSlide()
  } // Renamed for clarity

  const backgroundStyle = { background: slide.background }

  return (
    <div className="relative" style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }} onClick={handleCanvasClick}>
      <div className="absolute inset-0 shadow-lg" style={backgroundStyle} onContextMenu={handleContextMenu}>
        {slide.content.map((element) => {
          // Generate a unique key that changes when the element content changes
          const contentHash = JSON.stringify(element)
          const uniqueKey = `${element.id}-${contentHash.length}`

          return (
            <SlideElementComponent
              key={uniqueKey}
              element={element}
              isSelected={selectedElementId === element.id}
              onClick={() => setSelectedElementId(element.id)}
              updatePosition={(x, y) => updateElementPosition(element.id, x, y)}
              updateSize={(width, height) => updateElementSize(element.id, width, height)}
              updateContent={updateElementContent}
              onEditingChange={onEditingChange}
              onDeleteElement={deleteElement}
              onEditElementWithAI={onEditElementWithAI}
              slideId={slide.slide_id}
            />
          )
        })}
      </div>
      <SlideContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={closeContextMenu}
        onEditWithAI={handleEditWithAI}
        onChangeBackground={handleChangeBackgroundDialog}
        onDuplicateSlide={handleDuplicateCurrentSlide}
        onDeleteSlide={handleDeleteCurrentSlide}
      />
      <BackgroundDialog
        isOpen={backgroundDialogOpen}
        onClose={() => setBackgroundDialogOpen(false)}
        onApplyColor={handleApplyBackgroundColor}
        onApplyImage={handleApplyBackgroundImage}
        currentBackground={slide.background}
        slideId={slide.slide_id} // Pass slideId for tracking background images
      />
    </div>
  )
}
