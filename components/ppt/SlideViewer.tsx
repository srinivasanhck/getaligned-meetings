"use client"

import React from "react"
import type { Slide } from "@/lib/redux/features/pptSlice"
import { Edit2, TrendingUp, AlertCircle,CheckCircle, XCircle } from "lucide-react"

interface SlideViewerProps {
  slide: Slide
  theme: string
  onEdit?: () => void
  /** used by the upcoming editor to highlight the active element */
  selectedId?: string
}

/**
 * Read-only renderer for a single slide JSON object.
 * – Guarantees every element is absolutely positioned (drag/resize-ready).
 * – Memoised so other slides don’t re-render when one changes.
 */
export const SlideViewer = React.memo(function SlideViewer({
  slide, theme, onEdit, selectedId }: SlideViewerProps) {

  /*  Helpers    */

  const getBackgroundStyle = () => {
    if (!slide.background) return { backgroundColor: "#ffffff" }

    switch (slide.background.type) {
      case "gradient":
        return { background: slide.background.value }
      case "image":
        return {
          backgroundImage: `url(${slide.background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      case "color":
      default:
        return { backgroundColor: slide.background.value || "#ffffff" }
    }
  }

  /* -------------------------------------------------------------- */
  /*  Element renderer                                              */
  /* -------------------------------------------------------------- */

  const renderContent = (content: any) => {
    if (!content) return null

    /** absolute-layout defaults so % top/left always work */
    const baseBox: React.CSSProperties = {
      position: "absolute",
      top: content.style?.top ?? 0,
      left: content.style?.left ?? 0,
      width: content.style?.width ?? "auto",
      height: content.style?.height ?? "auto",
      ...content.style,
      outline: selectedId && selectedId === content.id ? "2px solid #3b82f6": content.style?.outline,
    }

    switch (content.type) {
      /* ---------------------------------------------------------- */
      /*  Textual                                                   */
      /* ---------------------------------------------------------- */
      case "heading":
        return (
          <div key={content.id} style={baseBox}>
            <h2 style={{ margin: 0 }}>{content.text}</h2>
          </div>
        )

      case "paragraph":
        return (
          <div key={content.id} style={baseBox}>
            <p style={{ margin: 0 }}>{content.text}</p>
          </div>
        )

      case "list": // adapter already normalises bullet_list → list
        return (
          <div key={content.id} style={baseBox}>
            <ul className="list-disc pl-5 space-y-2">
              {content.items?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )

      case "numbered_list": // keep for legacy data
        return (
          <div key={content.id} style={baseBox}>
            <ol className="list-decimal pl-5 space-y-2">
              {content.items?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Media                                                     */
      /* ---------------------------------------------------------- */
      case "image":
        return (
          <div key={content.id} style={baseBox}>
            <img
              src={content.url || "/placeholder.svg"}
              alt="Slide image"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )

      case "infographic":
        return (
          <div key={content.id} style={baseBox}>
            <img
              src={content.src || "/placeholder.svg"}
              alt="Infographic"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => (e.currentTarget.src = "/infographic.png")}
            />
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Table                                                     */
      /* ---------------------------------------------------------- */
      case "table":
        return (
          <div key={content.id} style={baseBox}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {content.headers?.map((h: string, i: number) => (
                    <th
                      key={i}
                      className="p-2 text-left"
                      style={{
                        backgroundColor: content.style?.headerBgColor || "#f3f4f6",
                        color: content.style?.headerTextColor || "#111827",
                        fontSize: content.style?.fontSize || "16px",
                        border: `1px solid ${content.style?.borderColor || "#e5e7eb"}`,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.rows?.map((row: string[], r: number) => (
                  <tr key={r}>
                    {row.map((cell: string, c: number) => (
                      <td
                        key={c}
                        className="p-2"
                        style={{
                          backgroundColor:
                            r % 2 === 0
                              ? content.style?.rowEvenBgColor || "#ffffff"
                              : content.style?.rowOddBgColor || "#f9fafb",
                          fontSize: content.style?.fontSize || "16px",
                          border: `1px solid ${content.style?.borderColor || "#e5e7eb"}`,
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Simple bar chart (placeholder)                            */
      /* ---------------------------------------------------------- */
      case "chart":
        return (
          <div key={content.id} style={baseBox}>
            <div className="p-4 flex flex-col items-center h-full">
              <div className="w-full flex items-end justify-center gap-4 h-full">
                {content.data?.datasets?.[0]?.data.map((v: number, i: number) => (
                  <div
                    key={i}
                    style={{
                      height: `${(v / Math.max(...content.data.datasets[0].data)) * 100}%`,
                      width: "20px",
                      backgroundColor: content.data.datasets[0].backgroundColor || "#4f46e5",
                    }}
                    className="rounded-t"
                  ></div>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {content.data?.labels?.map((l: string, i: number) => (
                  <span key={i} className="mx-2">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Quote / callout                                           */
      /* ---------------------------------------------------------- */
      case "quote":
        return (
          <div key={content.id} style={baseBox}>
            <blockquote>
              <p>{content.text}</p>
              {content.author && <footer>— {content.author}</footer>}
            </blockquote>
          </div>
        )

      case "callout":
        return (
          <div key={content.id} style={baseBox}>
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-1" />
              <p style={{ margin: 0 }}>{content.text}</p>
            </div>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Icon                                                      */
      /* ---------------------------------------------------------- */
      case "icon":
        return (
          <div
            key={content.id}
            style={{ display: "flex", alignItems: "center", gap: "8px", ...baseBox }}
          >
            <span
              className="flex items-center justify-center"
              style={{
                width: content.style?.iconSize || "24px",
                height: content.style?.iconSize || "24px",
                color: content.style?.iconColor || "currentColor",
              }}
            >
              {content.iconName === "trending-up" ? (
                <TrendingUp size={parseInt(content.style?.iconSize) || 24} />
              ) : content.iconName === "alert-circle" ? (
                <AlertCircle size={parseInt(content.style?.iconSize) || 24} />
              ) : content.iconName === "check-circle" ? (
                <CheckCircle size={parseInt(content.style?.iconSize) || 24} />
              ) : content.iconName === "x-circle" ? (
                <XCircle size={parseInt(content.style?.iconSize) || 24} />
              ) : (
                "●"
              )}
            </span>
            {content.text && <span>{content.text}</span>}
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Timeline                                                  */
      /* ---------------------------------------------------------- */
      case "timeline":
        return (
          <div key={content.id} style={baseBox}>
            <div className="relative">
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: content.style?.lineColor || "#3b82f6" }}
              />
              <div className="space-y-6 pl-6">
                {content.events?.map((e: any, i: number) => (
                  <div key={i} className="relative">
                    <div
                      className="absolute left-[-24px] top-1 w-4 h-4 rounded-full"
                      style={{ backgroundColor: content.style?.pointColor || "#1e40af" }}
                    />
                    <div className="flex flex-col">
                      <span
                        className="font-semibold"
                        style={{ color: content.style?.textColor || "#1f2937", fontSize: content.style?.fontSize }}
                      >
                        {e.date}
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          color: content.style?.textColor || "#1f2937",
                          fontSize: content.style?.fontSize
                            ? `calc(${content.style.fontSize} + 2px)`
                            : "16px",
                        }}
                      >
                        {e.title}
                      </span>
                      {e.description && (
                        <span
                          style={{ color: content.style?.textColor || "#1f2937", fontSize: content.style?.fontSize }}
                        >
                          {e.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  Comparison                                                */
      /* ---------------------------------------------------------- */
      case "comparison":
        return (
          <div key={content.id} style={baseBox}>
            <div className="p-4">
              {content.title && (
                <h3
                  className="text-center font-bold mb-4"
                  style={{ fontSize: `calc(${content.style?.fontSize || "14px"} + 4px)` }}
                >
                  {content.title}
                </h3>
              )}
              <div className="flex">
                {/* left */}
                <div className="flex-1 p-3 border-r" style={{ borderColor: content.style?.borderColor || "#e5e7eb" }}>
                  <h4 className="font-semibold mb-2 text-center" style={{ color: content.style?.leftColor || "#4338ca" }}>
                    {content.leftTitle}
                  </h4>
                  <ul className="list-disc pl-5">
                    {content.leftPoints?.map((p: string, i: number) => (
                      <li key={i} style={{ fontSize: content.style?.fontSize }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* right */}
                <div className="flex-1 p-3">
                  <h4
                    className="font-semibold mb-2 text-center"
                    style={{ color: content.style?.rightColor || "#0ea5e9" }}
                  >
                    {content.rightTitle}
                  </h4>
                  <ul className="list-disc pl-5">
                    {content.rightPoints?.map((p: string, i: number) => (
                      <li key={i} style={{ fontSize: content.style?.fontSize }}>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      /* ---------------------------------------------------------- */
      /*  NEW: two_column layout                                    */
      /* ---------------------------------------------------------- */
      case "two_column":
        return (
          <div key={content.id} style={baseBox}>
            <div className="flex h-full">
              <div className="flex-1 pr-4">
                {content.left?.map((child: any, i: number) => (
                  <p key={i} style={{ marginBottom: "0.5rem" }}>
                    {child}
                  </p>
                ))}
              </div>
              <div className="flex-1 pl-4 border-l" style={{ borderColor: content.style?.borderColor || "#e5e7eb" }}>
                {content.right?.map((child: any, i: number) => (
                  <p key={i} style={{ marginBottom: "0.5rem" }}>
                    {child}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )

      /* ---------------------------------------------------------- */
      default:
        return null
    }
  }

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */

  return (
    <div
      className="w-full aspect-[16/9] rounded-lg overflow-hidden shadow-md relative"
      style={getBackgroundStyle()}
    >
      {slide.content?.map(renderContent)}

      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          title="Edit slide"
        >
          <Edit2 size={16} />
        </button>
      )}
    </div>
  )
})









// "use client"

// import type { Slide } from "@/lib/redux/features/pptSlice"
// import { Edit2, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"

// interface SlideViewerProps {
//   slide: Slide
//   theme: string
//   onEdit?: () => void
// }

// export function SlideViewer({ slide, theme, onEdit }: SlideViewerProps) {
//   // Function to render different content types
//   const renderContent = (content: any) => {
//     // Skip rendering if no content
//     if (!content) return null

//     switch (content.type) {
//       case "heading":
//         return (
//           <div
//             key={`${slide.slide_id}-heading-${content.id || content.text?.substring(0, 10)}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <h2
//               style={{
//                 margin: 0,
//                 padding: 0,
//               }}
//             >
//               {content.text}
//             </h2>
//           </div>
//         )

//       case "paragraph":
//         return (
//           <div
//             key={`${slide.slide_id}-paragraph-${content.id || content.text?.substring(0, 10)}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <p style={{ margin: 0, padding: 0 }}>{content.text}</p>
//           </div>
//         )

//       case "bullet_list":
//       case "list":
//         return (
//           <div
//             key={`${slide.slide_id}-list-${content.id || content.items?.[0]?.substring(0, 10) || "list"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <ul className="list-disc pl-5 space-y-2" style={{ margin: 0, padding: 0, paddingLeft: "1.5rem" }}>
//               {content.items?.map((item: string, index: number) => (
//                 <li key={`${slide.slide_id}-list-item-${index}`}>{item}</li>
//               ))}
//             </ul>
//           </div>
//         )

//       case "numbered_list":
//         return (
//           <div
//             key={`${slide.slide_id}-numbered-list-${content.id || content.items?.[0]?.substring(0, 10) || "list"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <ol className="list-decimal pl-5 space-y-2" style={{ margin: 0, padding: 0, paddingLeft: "1.5rem" }}>
//               {content.items?.map((item: string, index: number) => (
//                 <li key={`${slide.slide_id}-numbered-list-item-${index}`}>{item}</li>
//               ))}
//             </ol>
//           </div>
//         )

//       case "image":
//         return (
//           <div
//             key={`${slide.slide_id}-image-${content.id || content.url?.substring(0, 10) || "image"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <img
//               src={content.url || "/placeholder.svg"}
//               alt="Slide image"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//               }}
//             />
//           </div>
//         )

//       case "infographic":
//         return (
//           <div
//             key={`${slide.slide_id}-infographic-${content.id || content.src?.substring(0, 10) || "infographic"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <img
//               src={content.src || "/placeholder.svg"}
//               alt="Infographic"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "contain",
//               }}
//               onError={(e) => {
//                 // Fallback for missing images
//                 e.currentTarget.src = "/infographic.png"
//               }}
//             />
//           </div>
//         )

//       case "table":
//         return (
//           <div
//             key={`${slide.slide_id}-table-${content.id || content.headers?.[0] || "table"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr>
//                   {content.headers?.map((header: string, index: number) => (
//                     <th
//                       key={`${slide.slide_id}-table-header-${index}`}
//                       className="p-2 text-left"
//                       style={{
//                         backgroundColor: content.style?.headerBgColor || "#f3f4f6",
//                         color: content.style?.headerTextColor || "#111827",
//                         fontSize: content.style?.fontSize || "16px",
//                         border: `1px solid ${content.style?.borderColor || "#e5e7eb"}`,
//                       }}
//                     >
//                       {header}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {content.rows?.map((row: string[], rowIndex: number) => (
//                   <tr key={`${slide.slide_id}-table-row-${rowIndex}`}>
//                     {row.map((cell: string, cellIndex: number) => (
//                       <td
//                         key={`${slide.slide_id}-table-cell-${rowIndex}-${cellIndex}`}
//                         className="p-2"
//                         style={{
//                           backgroundColor:
//                             rowIndex % 2 === 0
//                               ? content.style?.rowEvenBgColor || "#ffffff"
//                               : content.style?.rowOddBgColor || "#f9fafb",
//                           fontSize: content.style?.fontSize || "16px",
//                           border: `1px solid ${content.style?.borderColor || "#e5e7eb"}`,
//                         }}
//                       >
//                         {cell}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )

//       case "chart":
//         return (
//           <div
//             key={`${slide.slide_id}-chart-${content.id || content.chartType || "chart"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <div className="p-4 flex flex-col items-center">
//               <div className="w-full h-full flex items-center justify-center">
//                 {/* Simplified chart representation */}
//                 <div className="flex items-end h-32 gap-4">
//                   {content.data?.datasets?.[0]?.data.map((value: number, index: number) => (
//                     <div
//                       key={`bar-${index}`}
//                       style={{
//                         height: `${(value / Math.max(...content.data.datasets[0].data)) * 100}%`,
//                         width: "20px",
//                         backgroundColor: content.data.datasets[0].backgroundColor || "#4f46e5",
//                       }}
//                       className="rounded-t"
//                     ></div>
//                   ))}
//                 </div>
//               </div>
//               <div className="mt-2 text-sm text-gray-600">
//                 {content.data?.labels?.map((label: string, index: number) => (
//                   <span key={`label-${index}`} className="mx-2">
//                     {label}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )

//       case "quote":
//         return (
//           <div
//             key={`${slide.slide_id}-quote-${content.id || content.text?.substring(0, 10) || "quote"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <blockquote>
//               <p>{content.text}</p>
//               {content.author && <footer>— {content.author}</footer>}
//             </blockquote>
//           </div>
//         )

//       case "icon":
//         return (
//           <div
//             key={`${slide.slide_id}-icon-${content.id || content.iconName || "icon"}`}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               ...(content.style || {}),
//             }}
//           >
//             {/* Simple icon representation */}
//             <span
//               className="flex items-center justify-center"
//               style={{
//                 width: content.style?.iconSize || "24px",
//                 height: content.style?.iconSize || "24px",
//                 color: content.style?.iconColor || "currentColor",
//               }}
//             >
//               {content.iconName === "trending-up" ? (
//                 <TrendingUp size={Number.parseInt(content.style?.iconSize) || 24} color={content.style?.iconColor} />
//               ) : content.iconName === "alert-circle" ? (
//                 <AlertCircle size={Number.parseInt(content.style?.iconSize) || 24} color={content.style?.iconColor} />
//               ) : content.iconName === "check-circle" ? (
//                 <CheckCircle size={Number.parseInt(content.style?.iconSize) || 24} color={content.style?.iconColor} />
//               ) : content.iconName === "x-circle" ? (
//                 <XCircle size={Number.parseInt(content.style?.iconSize) || 24} color={content.style?.iconColor} />
//               ) : (
//                 "●" // Default icon
//               )}
//             </span>
//             {content.text && <span>{content.text}</span>}
//           </div>
//         )

//       case "timeline":
//         return (
//           <div
//             key={`${slide.slide_id}-timeline-${content.id || content.events?.[0]?.title || "timeline"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <div className="relative">
//               {/* Timeline line */}
//               <div
//                 className="absolute left-0 top-0 bottom-0 w-0.5"
//                 style={{ backgroundColor: content.style?.lineColor || "#3b82f6" }}
//               ></div>

//               {/* Timeline events */}
//               <div className="space-y-6 pl-6">
//                 {content.events?.map((event: any, index: number) => (
//                   <div key={`timeline-event-${index}`} className="relative">
//                     {/* Timeline point */}
//                     <div
//                       className="absolute left-[-24px] top-1 w-4 h-4 rounded-full"
//                       style={{ backgroundColor: content.style?.pointColor || "#1e40af" }}
//                     ></div>
//                     <div className="flex flex-col">
//                       <span
//                         className="font-semibold"
//                         style={{ color: content.style?.textColor || "#1f2937", fontSize: content.style?.fontSize }}
//                       >
//                         {event.date}
//                       </span>
//                       <span
//                         className="font-bold"
//                         style={{
//                           color: content.style?.textColor || "#1f2937",
//                           fontSize: content.style?.fontSize ? `calc(${content.style.fontSize} + 2px)` : "16px",
//                         }}
//                       >
//                         {event.title}
//                       </span>
//                       {event.description && (
//                         <span
//                           style={{ color: content.style?.textColor || "#1f2937", fontSize: content.style?.fontSize }}
//                         >
//                           {event.description}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )

//       case "comparison":
//         return (
//           <div
//             key={`${slide.slide_id}-comparison-${content.id || content.title || "comparison"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <div className="p-4">
//               {content.title && (
//                 <h3
//                   className="text-center font-bold mb-4"
//                   style={{ fontSize: `calc(${content.style?.fontSize || "14px"} + 4px)` }}
//                 >
//                   {content.title}
//                 </h3>
//               )}
//               <div className="flex">
//                 {/* Left side */}
//                 <div className="flex-1 p-3 border-r" style={{ borderColor: content.style?.borderColor || "#e5e7eb" }}>
//                   <h4
//                     className="font-semibold mb-2 text-center"
//                     style={{ color: content.style?.leftColor || "#4338ca" }}
//                   >
//                     {content.leftTitle}
//                   </h4>
//                   <ul className="list-disc pl-5">
//                     {content.leftPoints?.map((point: string, index: number) => (
//                       <li key={`left-point-${index}`} style={{ fontSize: content.style?.fontSize }}>
//                         {point}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 {/* Right side */}
//                 <div className="flex-1 p-3">
//                   <h4
//                     className="font-semibold mb-2 text-center"
//                     style={{ color: content.style?.rightColor || "#0ea5e9" }}
//                   >
//                     {content.rightTitle}
//                   </h4>
//                   <ul className="list-disc pl-5">
//                     {content.rightPoints?.map((point: string, index: number) => (
//                       <li key={`right-point-${index}`} style={{ fontSize: content.style?.fontSize }}>
//                         {point}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )

//       case "callout":
//         return (
//           <div
//             key={`${slide.slide_id}-callout-${content.id || content.text?.substring(0, 10) || "callout"}`}
//             style={{
//               ...(content.style || {}),
//             }}
//           >
//             <div className="flex items-start gap-2">
//               <AlertCircle size={16} className="mt-1" />
//               <p style={{ margin: 0 }}>{content.text}</p>
//             </div>
//           </div>
//         )

//       default:
//         return null
//     }
//   }

//   // Get background style based on background type
//   const getBackgroundStyle = () => {
//     if (!slide.background) {
//       return { backgroundColor: "#ffffff" }
//     }

//     switch (slide.background.type) {
//       case "gradient":
//         return { background: slide.background.value }
//       case "image":
//         return {
//           backgroundImage: `url(${slide.background.value})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }
//       case "color":
//       default:
//         return { backgroundColor: slide.background.value || "#ffffff" }
//     }
//   }

//   return (
//     <div className="w-full aspect-[16/9] rounded-lg overflow-hidden shadow-md relative" style={getBackgroundStyle()}>
//       {slide.content?.map((content) => renderContent(content))}

//       {/* Add edit button if onEdit is provided */}
//       {onEdit && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation()
//             onEdit()
//           }}
//           className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
//           title="Edit slide"
//         >
//           <Edit2 size={16} />
//         </button>
//       )}
//     </div>
//   )
// }
