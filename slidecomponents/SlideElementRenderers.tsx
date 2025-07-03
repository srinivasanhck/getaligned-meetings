"use client"

import type React from "react"
import type {
  TextElementProps,
  ImageElementProps,
  ChartElementProps,
  ShapeElementProps,
  DataVisualization,
  BarChartData,
  LineChartData,
  PieChartData,
  TableData,
  SlideElement, // Added for onElementUpdate
} from "@/types"
import Icon from "./Icon"
import { CHART_COLORS } from "@/constants"
import { useState, useRef, useEffect, useCallback } from "react"

// --- Chart Rendering Logic (Adapted from old SlideCard) ---
const SVG_VIEWBOX_WIDTH = 400
const SVG_VIEWBOX_HEIGHT = 250
const SVG_PADDING = 40

const renderBarChart = (data: BarChartData, textColor = "#334155") => {
  // Default to a dark slate color
  if (!data.data || data.data.length === 0)
    return <p className={`text-center text-sm ${textColor} opacity-80 p-4`}>No data for bar chart.</p>
  const maxValue = Math.max(...data.data.map((item) => item.value), 0)
  const chartAreaWidth = SVG_VIEWBOX_WIDTH - SVG_PADDING * 2
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - SVG_PADDING * 2
  const barWidth = chartAreaWidth / (data.data.length * 1.5 + 0.5)
  const spacing = barWidth * 0.5
  const numGridLines = 5

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && (
        <h4 className={`text-xs sm:text-sm font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>
      )}
      <svg
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {Array.from({ length: numGridLines + 1 }).map((_, i) => {
          const y = SVG_PADDING + (i * chartAreaHeight) / numGridLines
          return (
            <g key={`grid-${i}`}>
              <line
                x1={SVG_PADDING}
                y1={y}
                x2={SVG_VIEWBOX_WIDTH - SVG_PADDING}
                y2={y}
                stroke="currentColor"
                className={`${textColor} opacity-20`}
                strokeWidth="0.5"
              />
              <text x={SVG_PADDING - 5} y={y + 3} textAnchor="end" fontSize="8" className={`${textColor} opacity-60`}>
                {(((numGridLines - i) * maxValue) / numGridLines).toFixed(0)}
              </text>
            </g>
          )
        })}
        <line
          x1={SVG_PADDING}
          y1={SVG_PADDING}
          x2={SVG_PADDING}
          y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          stroke="currentColor"
          className={`${textColor} opacity-50`}
          strokeWidth="1"
        />
        <line
          x1={SVG_PADDING}
          y1={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          x2={SVG_VIEWBOX_WIDTH - SVG_PADDING}
          y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          stroke="currentColor"
          className={`${textColor} opacity-50`}
          strokeWidth="1"
        />
        <g transform={`translate(${SVG_PADDING}, ${SVG_VIEWBOX_HEIGHT - SVG_PADDING}) scale(1, -1)`}>
          {data.data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * chartAreaHeight : 0
            const x = spacing + index * (barWidth + spacing)
            const color = item.color || CHART_COLORS[index % CHART_COLORS.length]
            return (
              <g key={item.label}>
                <rect
                  x={x}
                  y="0"
                  width={barWidth}
                  height={Math.max(0, barHeight)}
                  fill={color}
                  className={`opacity-80 hover:opacity-100 transition-opacity`}
                />
                {item.value !== 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={-barHeight - 3}
                    textAnchor="middle"
                    fontSize="8"
                    fill={textColor}
                    className={`opacity-90`}
                    transform="scale(1, -1)"
                  >
                    {item.value}
                  </text>
                )}
                <text
                  x={x + barWidth / 2}
                  y={12}
                  textAnchor="middle"
                  fontSize="8"
                  className={`${textColor} opacity-90`}
                  transform="scale(1, -1)"
                >
                  {item.label}
                </text>
              </g>
            )
          })}
        </g>
        {data.xAxisLabel && (
          <text
            x={SVG_VIEWBOX_WIDTH / 2}
            y={SVG_VIEWBOX_HEIGHT - SVG_PADDING / 4}
            textAnchor="middle"
            fontSize="9"
            className={`${textColor} opacity-70 font-medium`}
          >
            {data.xAxisLabel}
          </text>
        )}
        {data.yAxisLabel && (
          <text
            x={SVG_PADDING / 4}
            y={SVG_VIEWBOX_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${SVG_PADDING / 4}, ${SVG_VIEWBOX_HEIGHT / 2})`}
            fontSize="9"
            className={`${textColor} opacity-70 font-medium`}
          >
            {data.yAxisLabel}
          </text>
        )}
      </svg>
    </div>
  )
}

const renderLineChart = (data: LineChartData, textColor = "#334155") => {
  if (!data.series || data.series.length === 0 || !data.series[0].data || data.series[0].data.length === 0) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-xs sm:text-sm font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="arrowTrendingUp" className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xxs sm:text-xs`}>No data available for Line Chart.</p>
        </div>
      </div>
    )
  }

  const series = data.series[0]
  const points = series.data

  if (points.length < 2) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-xs sm:text-sm font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="arrowTrendingUp" className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xxs sm:text-xs`}>Not enough data points for a line chart.</p>
          {points.length === 1 && (
            <p className={`text-xxs ${textColor} opacity-60`}>
              Point: ({points[0].label}, {points[0].value})
            </p>
          )}
        </div>
      </div>
    )
  }

  const chartAreaWidth = SVG_VIEWBOX_WIDTH - 2 * SVG_PADDING
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - 2 * SVG_PADDING

  const yValues = points.map((p) => p.value)
  const minYValue = Math.min(...yValues)
  const maxYValue = Math.max(...yValues)
  const yRange = maxYValue - minYValue === 0 ? 1 : maxYValue - minYValue

  const xStep = chartAreaWidth / (points.length - 1)
  const numGridLines = 5
  const lineColor = series.color || CHART_COLORS[0]

  const pathPoints = points
    .map((point, index) => {
      const x = SVG_PADDING + index * xStep
      const y = SVG_VIEWBOX_HEIGHT - SVG_PADDING - ((point.value - minYValue) / yRange) * chartAreaHeight
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && (
        <h4 className={`text-xs sm:text-sm font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>
      )}
      <svg
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {Array.from({ length: numGridLines + 1 }).map((_, i) => {
          const y = SVG_PADDING + (i * chartAreaHeight) / numGridLines
          const value = maxYValue - (i * yRange) / numGridLines
          return (
            <g key={`h-grid-${i}`}>
              <line
                x1={SVG_PADDING}
                y1={y}
                x2={SVG_VIEWBOX_WIDTH - SVG_PADDING}
                y2={y}
                stroke="currentColor"
                className={`${textColor} opacity-20`}
                strokeWidth="0.5"
              />
              <text x={SVG_PADDING - 5} y={y + 3} textAnchor="end" fontSize="8" className={`${textColor} opacity-60`}>
                {value.toFixed(yRange < 10 ? 1 : 0)}
              </text>
            </g>
          )
        })}
        {points.map((point, index) => {
          const x = SVG_PADDING + index * xStep
          return (
            <g key={`v-grid-${index}`}>
              {index > 0 && index < points.length - 1 && (
                <line
                  x1={x}
                  y1={SVG_PADDING}
                  x2={x}
                  y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
                  stroke="currentColor"
                  className={`${textColor} opacity-10`}
                  strokeWidth="0.5"
                />
              )}
              <text
                x={x}
                y={SVG_VIEWBOX_HEIGHT - SVG_PADDING + 12}
                textAnchor="middle"
                fontSize="8"
                className={`${textColor} opacity-90`}
              >
                {point.label}
              </text>
            </g>
          )
        })}
        <line
          x1={SVG_PADDING}
          y1={SVG_PADDING}
          x2={SVG_PADDING}
          y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          stroke="currentColor"
          className={`${textColor} opacity-50`}
          strokeWidth="1"
        />
        <line
          x1={SVG_PADDING}
          y1={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          x2={SVG_VIEWBOX_WIDTH - SVG_PADDING}
          y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING}
          stroke="currentColor"
          className={`${textColor} opacity-50`}
          strokeWidth="1"
        />
        <polyline fill="none" stroke={lineColor} strokeWidth="1.5" points={pathPoints} className={`opacity-80`} />
        {points.map((point, index) => {
          const x = SVG_PADDING + index * xStep
          const y = SVG_VIEWBOX_HEIGHT - SVG_PADDING - ((point.value - minYValue) / yRange) * chartAreaHeight
          return (
            <g key={`point-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="2.5"
                fill={lineColor}
                className={`opacity-90 hover:opacity-100 cursor-pointer`}
              />
              <title>{`${point.label}: ${point.value}`}</title>
              <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill={textColor} className={`opacity-70`}>
                {point.value}
              </text>
            </g>
          )
        })}
        {data.xAxisLabel && (
          <text
            x={SVG_VIEWBOX_WIDTH / 2}
            y={SVG_VIEWBOX_HEIGHT - SVG_PADDING / 4}
            textAnchor="middle"
            fontSize="9"
            className={`${textColor} opacity-70 font-medium`}
          >
            {data.xAxisLabel}
          </text>
        )}
        {data.yAxisLabel && (
          <text
            x={SVG_PADDING / 4}
            y={SVG_VIEWBOX_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${SVG_PADDING / 4}, ${SVG_VIEWBOX_HEIGHT / 2})`}
            fontSize="9"
            className={`${textColor} opacity-70 font-medium`}
          >
            {data.yAxisLabel}
          </text>
        )}
      </svg>
    </div>
  )
}

const renderPieChart = (data: PieChartData, textColor = "#334155") => {
  if (!data.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-xs sm:text-sm font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="chartPie" className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xxs sm:text-xs`}>No data available for Pie Chart.</p>
        </div>
      </div>
    )
  }
  const totalValue = data.data.reduce((sum, item) => sum + item.value, 0)
  if (totalValue === 0) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-xs sm:text-sm font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="chartPie" className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xxs sm:text-xs`}>All pie chart values are zero.</p>
        </div>
      </div>
    )
  }
  const chartAreaWidth = SVG_VIEWBOX_WIDTH - SVG_PADDING * 0.5
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - SVG_PADDING * 0.5
  const cx = SVG_VIEWBOX_WIDTH / 2.8
  const cy = SVG_VIEWBOX_HEIGHT / 2
  const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2.8
  let startAngle = -Math.PI / 2

  const slices = data.data.map((item, index) => {
    const percentage = item.value / totalValue
    const angle = percentage * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)
    const largeArcFlag = angle > Math.PI ? 1 : 0
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(" ")
    const slice = {
      pathData,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      label: item.label,
      value: item.value,
      percentage: (percentage * 100).toFixed(1),
    }
    startAngle = endAngle
    return slice
  })
  const legendX = cx + radius + 15
  const legendY = SVG_PADDING / 1.8
  const legendItemHeight = 15
  const legendRectSize = 7

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && (
        <h4 className={`text-xs sm:text-sm font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>
      )}
      <svg
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
            </path>
          ))}
        </g>
        <g className="legend">
          {slices.map((slice, index) => (
            <g key={`legend-${index}`} transform={`translate(${legendX}, ${legendY + index * legendItemHeight})`}>
              <rect
                width={legendRectSize}
                height={legendRectSize}
                fill={slice.color}
                rx="1.5"
                ry="1.5"
                className="opacity-80"
              />
              <text
                x={legendRectSize + 4}
                y={legendRectSize / 2 + 2}
                fontSize="7"
                className={`${textColor} opacity-90`}
                dominantBaseline="middle"
              >{`${slice.label} (${slice.percentage}%)`}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

const renderTable = (data: TableData, textColor = "#334155") => {
  if (!data.headers || !data.rows) {
    return <p className={`text-center text-sm ${textColor} opacity-80 p-4`}>Table data is incomplete.</p>
  }
  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && (
        <h4 className={`text-xs sm:text-sm font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>
      )}
      <div className="overflow-auto w-full h-full custom-scrollbar">
        <table className={`w-full min-w-max text-xxs sm:text-xs ${textColor}`}>
          <thead className={`${textColor} opacity-80`}>
            <tr>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className={`p-1 sm:p-1.5 border border-slate-300 text-left font-semibold bg-slate-100 whitespace-nowrap`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${textColor} opacity-90 even:bg-slate-50 hover:bg-slate-100 transition-colors`}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={`p-1 sm:p-1.5 border border-slate-300 whitespace-nowrap`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const renderDataVisualization = (dataViz: DataVisualization, textColor?: string) => {
  const effectiveTextColor = textColor || "#334155" // Default to dark slate for light backgrounds
  switch (dataViz.type) {
    case "barChart":
      return renderBarChart(dataViz as BarChartData, effectiveTextColor)
    case "lineChart":
      return renderLineChart(dataViz as LineChartData, effectiveTextColor)
    case "pieChart":
      return renderPieChart(dataViz as PieChartData, effectiveTextColor)
    case "table":
      return renderTable(dataViz as TableData, effectiveTextColor)
    default:
      return (
        <p className={`${effectiveTextColor} opacity-70 p-4 text-xs sm:text-sm`}>
          Unsupported data visualization type.
        </p>
      )
  }
}

export const EditableText: React.FC<{
  element: TextElementProps
  defaultTextColor?: string
  isEditing?: boolean
  onElementUpdate: (updatedElement: SlideElement) => void
}> = ({ element, defaultTextColor, isEditing = false, onElementUpdate }) => {
  const textRef = useRef<HTMLDivElement>(null)
  const [contentKey, setContentKey] = useState(0)

  // Store selection to restore it after re-render
  const selectionRef = useRef<{ start: number; end: number; direction: "forward" | "backward" | "none" } | null>(null)

  // Check if this is a bullet list
  const isBulletList = element.content.includes("•") || element.content.includes("\n• ")
  const isNumberedList =
    /^\d+\./.test(element.content) || element.content.includes("\n1.") || element.content.includes("\n2.")

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus()
      // Restore selection if it exists
      if (selectionRef.current && window.getSelection) {
        const selection = window.getSelection()
        if (selection && textRef.current.firstChild) {
          try {
            const range = document.createRange()
            const textNodeLength = textRef.current.firstChild.textContent?.length || 0
            const start = Math.min(selectionRef.current.start, textNodeLength)
            const end = Math.min(selectionRef.current.end, textNodeLength)

            range.setStart(textRef.current.firstChild, start)
            range.setEnd(textRef.current.firstChild, end)
            selection.removeAllRanges()
            selection.addRange(range)
          } catch (e) {
            console.warn("Could not restore selection:", e)
          }
        }
      }
    }
  }, [isEditing, element.content, contentKey])

  // If external content changes, update internal state and key
  useEffect(() => {
    if (textRef.current && textRef.current.innerHTML !== element.content) {
      textRef.current.innerHTML = element.content
      setContentKey((prev) => prev + 1)
    }
  }, [element.content])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isEditing) return

      // Handle Enter key for lists
      if (e.key === "Enter") {
        e.preventDefault()

        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return

        const range = selection.getRangeAt(0)
        const currentText = textRef.current?.textContent || ""

        // Get cursor position
        const cursorPosition = range.startOffset
        const textBeforeCursor = currentText.substring(0, cursorPosition)
        const textAfterCursor = currentText.substring(cursorPosition)

        let newContent = ""

        if (isBulletList) {
          // Add new bullet point
          newContent = textBeforeCursor + "\n• " + textAfterCursor
        } else if (isNumberedList) {
          // Find the current number and increment
          const lines = textBeforeCursor.split("\n")
          const currentLine = lines[lines.length - 1]
          const numberMatch = currentLine.match(/^(\d+)\./)

          if (numberMatch) {
            const nextNumber = Number.parseInt(numberMatch[1]) + 1
            newContent = textBeforeCursor + `\n${nextNumber}. ` + textAfterCursor
          } else {
            newContent = textBeforeCursor + "\n1. " + textAfterCursor
          }
        } else {
          // Regular text - just add line break
          newContent = textBeforeCursor + "\n" + textAfterCursor
        }

        // Update the element
        onElementUpdate({ ...element, content: newContent })

        // Set cursor position after the new bullet/number
        setTimeout(() => {
          if (textRef.current) {
            const newCursorPos = textBeforeCursor.length + (isBulletList ? 3 : isNumberedList ? 4 : 1)
            const range = document.createRange()
            const selection = window.getSelection()

            if (textRef.current.firstChild) {
              range.setStart(
                textRef.current.firstChild,
                Math.min(newCursorPos, textRef.current.textContent?.length || 0),
              )
              range.collapse(true)
              selection?.removeAllRanges()
              selection?.addRange(range)
            }
          }
        }, 0)
      }
    },
    [isEditing, isBulletList, isNumberedList, element, onElementUpdate],
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = e.currentTarget.textContent || ""

      // Save selection before updating state
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        selectionRef.current = {
          start: range.startOffset,
          end: range.endOffset,
          direction: selection.anchorOffset <= selection.focusOffset ? "forward" : "backward",
        }
      }

      // Update the parent component immediately
      onElementUpdate({ ...element, content: newContent })
    },
    [element, onElementUpdate],
  )

  const textStyle: React.CSSProperties = {
    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
    color: element.color || defaultTextColor || "#000000",
    fontWeight: element.fontWeight || undefined,
    fontStyle: element.fontStyle || undefined,
    textDecoration: element.textDecoration || undefined,
    textAlign: element.textAlign || undefined,
    lineHeight: element.lineHeight || undefined,
    fontFamily: element.fontFamily || "Inter, sans-serif",
    backgroundColor: element.backgroundColor || "transparent",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
    textShadow: element.textShadow || undefined,
    paddingTop: `${element.paddingTop !== undefined ? element.paddingTop : 2}px`,
    paddingRight: `${element.paddingRight !== undefined ? element.paddingRight : 2}px`,
    paddingBottom: `${element.paddingBottom !== undefined ? element.paddingBottom : 2}px`,
    paddingLeft: `${element.paddingLeft !== undefined ? element.paddingLeft : 2}px`,
    opacity: element.opacity !== undefined ? element.opacity : 1,
    display: "flex",
    alignItems: element.verticalAlign || "flex-start",
    justifyContent: element.textAlign || "flex-start",
    outline: "none",
    cursor: isEditing ? "text" : "inherit",
  }

  const renderContent = () => {
    return (
      <div
        key={contentKey}
        ref={textRef}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{ outline: "none", width: "100%", height: "100%" }}
      >
        {element.content || " "}
      </div>
    )
  }

  return (
    <div style={textStyle} className="break-words">
      {element.hyperlink && !isEditing ? (
        <a
          href={element.hyperlink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          {renderContent()}
        </a>
      ) : (
        renderContent()
      )}
    </div>
  )
}

export const EditableImage: React.FC<{ element: ImageElementProps }> = ({ element }) => {
  return (
    <img
      src={element.src || "/placeholder.svg"}
      alt={element.alt || "Image element"}
      style={{
        width: "100%",
        height: "100%",
        objectFit: element.objectFit || "contain",
        opacity: element.opacity !== undefined ? element.opacity : 1,
      }}
      onDragStart={(e) => e.preventDefault()}
    />
  )
}

export const EditableChart: React.FC<{ element: ChartElementProps; defaultTextColor?: string }> = ({
  element,
  defaultTextColor,
}) => {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-xs"
      style={{ opacity: element.opacity !== undefined ? element.opacity : 1 }}
    >
      {renderDataVisualization(element.chartProperties, defaultTextColor)}
    </div>
  )
}

export const EditableShape: React.FC<{ element: ShapeElementProps }> = ({ element }) => {
  const shapeStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundColor: element.fillColor || "transparent",
    borderStyle: element.strokeWidth && element.strokeWidth > 0 ? "solid" : "none",
    borderColor: element.strokeColor || "transparent",
    borderWidth: element.strokeWidth ? `${element.strokeWidth}px` : undefined,
    opacity: element.opacity !== undefined ? element.opacity : 1,
    boxSizing: "border-box",
    borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
  }

  if (element.shapeType === "rectangle" || element.shapeType === "ellipse") {
    return <div style={shapeStyle} />
  }
  return (
    <div style={shapeStyle} className="text-xs text-center text-slate-500 p-1">
      Unsupported Shape
    </div>
  )
}
