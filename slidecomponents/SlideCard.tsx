

import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement, TextElementProps, ImageElementProps, ChartElementProps, ShapeElementProps, DataVisualization, BarChartData, LineChartData, PieChartData, TableData, ParentDimensions } from '@/types';
import ElementWrapper from './editing/ElementWrapper';
import Icon from './Icon';
import { CHART_COLORS } from '@/constants';

// --- Chart Rendering Logic (Simplified & Adapted from old SlideCard) ---
const SVG_VIEWBOX_WIDTH = 400;
const SVG_VIEWBOX_HEIGHT = 250; 
const SVG_PADDING = 40; 

const renderBarChart = (data: BarChartData, textColor: string = '#FFFFFF') => {
  if (data.data.length === 0) return <p className={`text-center ${textColor} opacity-80 p-4 text-sm`}>No data for bar chart.</p>;
  const maxValue = Math.max(...data.data.map(item => item.value), 0);
  const chartAreaWidth = SVG_VIEWBOX_WIDTH - SVG_PADDING * 2;
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - SVG_PADDING * 2;
  const barWidth = chartAreaWidth / (data.data.length * 1.5 + 0.5) ; 
  const spacing = barWidth * 0.5;
  const numGridLines = 5;

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>}
      <svg viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: numGridLines + 1 }).map((_, i) => {
          const y = SVG_PADDING + (i * chartAreaHeight / numGridLines);
          return (
            <g key={`grid-${i}`}>
              <line x1={SVG_PADDING} y1={y} x2={SVG_VIEWBOX_WIDTH - SVG_PADDING} y2={y} stroke="currentColor" className={`${textColor} opacity-20`} strokeWidth="0.5"/>
              <text x={SVG_PADDING - 5} y={y + 3} textAnchor="end" fontSize="8" className={`${textColor} opacity-60`}>{((numGridLines - i) * maxValue / numGridLines).toFixed(0)}</text>
            </g>
          );
        })}
        <line x1={SVG_PADDING} y1={SVG_PADDING} x2={SVG_PADDING} y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING} stroke="currentColor" className={`${textColor} opacity-50`} strokeWidth="1"/>
        <line x1={SVG_PADDING} y1={SVG_VIEWBOX_HEIGHT - SVG_PADDING} x2={SVG_VIEWBOX_WIDTH - SVG_PADDING} y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING} stroke="currentColor" className={`${textColor} opacity-50`} strokeWidth="1"/>
        <g transform={`translate(${SVG_PADDING}, ${SVG_VIEWBOX_HEIGHT - SVG_PADDING}) scale(1, -1)`}>
          {data.data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * chartAreaHeight : 0;
            const x = spacing + index * (barWidth + spacing);
            const color = item.color || CHART_COLORS[index % CHART_COLORS.length];
            return (
              <g key={item.label}>
                <rect x={x} y="0" width={barWidth} height={Math.max(0, barHeight)} fill={color} className={`opacity-80 hover:opacity-100 transition-opacity`}/>
                {item.value !== 0 && (<text x={x + barWidth / 2} y={-barHeight - 3} textAnchor="middle" fontSize="8" fill={textColor} className={`opacity-90`} transform="scale(1, -1)" >{item.value}</text>)}
                <text x={x + barWidth / 2} y={12} textAnchor="middle" fontSize="8" className={`${textColor} opacity-90`} transform="scale(1, -1)">{item.label}</text>
              </g>
            );
          })}
        </g>
         {data.xAxisLabel && <text x={SVG_VIEWBOX_WIDTH/2} y={SVG_VIEWBOX_HEIGHT - SVG_PADDING/4} textAnchor="middle" fontSize="9" className={`${textColor} opacity-70 font-medium`}>{data.xAxisLabel}</text>}
         {data.yAxisLabel && <text x={SVG_PADDING/4} y={SVG_VIEWBOX_HEIGHT/2} textAnchor="middle" transform={`rotate(-90, ${SVG_PADDING/4}, ${SVG_VIEWBOX_HEIGHT/2})`} fontSize="9" className={`${textColor} opacity-70 font-medium`}>{data.yAxisLabel}</text>}
      </svg>
    </div>
  );
};

const renderLineChart = (data: LineChartData, textColor: string = '#FFFFFF') => {
    if (!data.series || data.series.length === 0 || data.series[0].data.length === 0) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="arrowTrendingUp" className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>No data available for Line Chart.</p>
        </div>
      </div>
    );
  }

  const series = data.series[0]; 
  const points = series.data;

  if (points.length < 2) {
     return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="arrowTrendingUp" className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>Not enough data points for a line chart.</p>
           {points.length === 1 && <p className={`text-xxs sm:text-xs ${textColor} opacity-60`}>Point: ({points[0].label}, {points[0].value})</p>}
        </div>
      </div>
    );
  }

  const chartAreaWidth = SVG_VIEWBOX_WIDTH - 2 * SVG_PADDING;
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - 2 * SVG_PADDING;

  const yValues = points.map(p => p.value);
  const minYValue = Math.min(...yValues);
  const maxYValue = Math.max(...yValues);
  const yRange = maxYValue - minYValue === 0 ? 1 : maxYValue - minYValue;

  const xStep = chartAreaWidth / (points.length - 1);
  const numGridLines = 5;
  const lineColor = series.color || CHART_COLORS[0];

  const pathPoints = points.map((point, index) => {
    const x = SVG_PADDING + index * xStep;
    const y = (SVG_VIEWBOX_HEIGHT - SVG_PADDING) - ((point.value - minYValue) / yRange) * chartAreaHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>}
      <svg viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: numGridLines + 1 }).map((_, i) => {
          const y = SVG_PADDING + (i * chartAreaHeight / numGridLines);
          const value = maxYValue - (i * yRange / numGridLines);
          return (
            <g key={`h-grid-${i}`}>
              <line x1={SVG_PADDING} y1={y} x2={SVG_VIEWBOX_WIDTH - SVG_PADDING} y2={y} stroke="currentColor" className={`${textColor} opacity-20`} strokeWidth="0.5"/>
              <text x={SVG_PADDING - 5} y={y + 3} textAnchor="end" fontSize="8" className={`${textColor} opacity-60`}>{value.toFixed(yRange < 10 ? 1 : 0)}</text>
            </g>
          );
        })}
        {points.map((point, index) => {
          const x = SVG_PADDING + index * xStep;
          return (
             <g key={`v-grid-${index}`}>
                {index > 0 && index < points.length -1 && ( 
                    <line x1={x} y1={SVG_PADDING} x2={x} y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING} stroke="currentColor" className={`${textColor} opacity-10`} strokeWidth="0.5"/>
                )}
                <text x={x} y={SVG_VIEWBOX_HEIGHT - SVG_PADDING + 12} textAnchor="middle" fontSize="8" className={`${textColor} opacity-90`}>{point.label}</text>
             </g>
          );
        })}
        <line x1={SVG_PADDING} y1={SVG_PADDING} x2={SVG_PADDING} y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING} stroke="currentColor" className={`${textColor} opacity-50`} strokeWidth="1"/>
        <line x1={SVG_PADDING} y1={SVG_VIEWBOX_HEIGHT - SVG_PADDING} x2={SVG_VIEWBOX_WIDTH - SVG_PADDING} y2={SVG_VIEWBOX_HEIGHT - SVG_PADDING} stroke="currentColor" className={`${textColor} opacity-50`} strokeWidth="1"/>
        <polyline fill="none" stroke={lineColor} strokeWidth="1.5" points={pathPoints} className={`opacity-80`}/>
        {points.map((point, index) => {
          const x = SVG_PADDING + index * xStep;
          const y = (SVG_VIEWBOX_HEIGHT - SVG_PADDING) - ((point.value - minYValue) / yRange) * chartAreaHeight;
          return (
            <g key={`point-${index}`}>
              <circle cx={x} cy={y} r="2.5" fill={lineColor} className={`opacity-90 hover:opacity-100 cursor-pointer`}/>
              <title>{`${point.label}: ${point.value}`}</title> 
               <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill={textColor} className={`opacity-70`}>{point.value}</text>
            </g>
          );
        })}
        {data.xAxisLabel && <text x={SVG_VIEWBOX_WIDTH/2} y={SVG_VIEWBOX_HEIGHT - SVG_PADDING/4} textAnchor="middle" fontSize="9" className={`${textColor} opacity-70 font-medium`}>{data.xAxisLabel}</text>}
        {data.yAxisLabel && <text x={SVG_PADDING/4} y={SVG_VIEWBOX_HEIGHT/2} textAnchor="middle" transform={`rotate(-90, ${SVG_PADDING/4}, ${SVG_VIEWBOX_HEIGHT/2})`} fontSize="9" className={`${textColor} opacity-70 font-medium`}>{data.yAxisLabel}</text>}
      </svg>
    </div>
  );
};

const renderPieChart = (data: PieChartData, textColor: string = '#FFFFFF') => {
  if (data.data.length === 0) {
    return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="chartPie" className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>No data available for Pie Chart.</p>
        </div>
      </div>
    );
  }
  const totalValue = data.data.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) {
     return (
      <div className="p-4 text-center h-full flex flex-col justify-center items-center">
        {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-2 ${textColor} truncate`}>{data.title}</h4>}
        <div className={`border-2 border-dashed ${textColor} opacity-30 p-6 rounded-md w-full max-w-xs`}>
          <Icon name="chartPie" className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 ${textColor} opacity-50`} />
          <p className={`${textColor} opacity-70 text-xs sm:text-sm`}>All pie chart values are zero.</p>
        </div>
      </div>
    );
  }
  const chartAreaWidth = SVG_VIEWBOX_WIDTH - SVG_PADDING * 0.5; 
  const chartAreaHeight = SVG_VIEWBOX_HEIGHT - SVG_PADDING * 0.5; 
  const cx = SVG_VIEWBOX_WIDTH / 2.8; 
  const cy = SVG_VIEWBOX_HEIGHT / 2;
  const radius = Math.min(chartAreaWidth, chartAreaHeight) / 2.8; 
  let startAngle = -Math.PI / 2; 

  const slices = data.data.map((item, index) => {
    const percentage = item.value / totalValue;
    const angle = percentage * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = [`M ${cx} ${cy}`, `L ${x1} ${y1}`, `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(' ');
    const slice = { pathData, color: item.color || CHART_COLORS[index % CHART_COLORS.length], label: item.label, value: item.value, percentage: (percentage * 100).toFixed(1) };
    startAngle = endAngle;
    return slice;
  });
  const legendX = cx + radius + 15; 
  const legendY = SVG_PADDING / 1.8;
  const legendItemHeight = 15;
  const legendRectSize = 7;

  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>}
      <svg viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <g>{slices.map((slice, index) => (<path key={index} d={slice.pathData} fill={slice.color} className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"><title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title></path>))}</g>
        <g className="legend">{slices.map((slice, index) => (<g key={`legend-${index}`} transform={`translate(${legendX}, ${legendY + index * legendItemHeight})`}><rect width={legendRectSize} height={legendRectSize} fill={slice.color} rx="1.5" ry="1.5" className="opacity-80"/><text x={legendRectSize + 4} y={legendRectSize / 2 + 2} fontSize="7" className={`${textColor} opacity-90`} dominantBaseline="middle">{`${slice.label} (${slice.percentage}%)`}</text></g>))}</g>
      </svg>
    </div>
  );
};

const renderTable = (data: TableData, textColor: string = '#FFFFFF') => {
  return (
    <div className="p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {data.title && <h4 className={`text-sm sm:text-base font-semibold mb-1 text-center ${textColor} truncate`}>{data.title}</h4>}
      <div className="overflow-auto w-full h-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
        <table className={`w-full min-w-max text-xxs sm:text-xs ${textColor}`}>
          <thead className={`${textColor} opacity-80`}><tr >{data.headers.map((header, index) => (<th key={index} className="p-1 sm:p-1.5 border border-slate-600/70 text-left font-semibold bg-slate-700/20 whitespace-nowrap">{header}</th>))}</tr></thead>
          <tbody>{data.rows.map((row, rowIndex) => (<tr key={rowIndex} className={`${textColor} opacity-90 even:bg-slate-700/20 hover:bg-slate-600/30 transition-colors`}>{row.map((cell, cellIndex) => (<td key={cellIndex} className="p-1 sm:p-1.5 border border-slate-700/50 whitespace-nowrap">{cell}</td>))}</tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

const renderDataVisualization = (dataViz: DataVisualization, textColor?: string) => {
  const effectiveTextColor = textColor || 'text-white';
  switch (dataViz.type) {
    case 'barChart': return renderBarChart(dataViz, effectiveTextColor);
    case 'lineChart': return renderLineChart(dataViz, effectiveTextColor);
    case 'pieChart': return renderPieChart(dataViz, effectiveTextColor);
    case 'table': return renderTable(dataViz, effectiveTextColor);
    default: return <p className={`${effectiveTextColor} opacity-70 p-4 text-xs sm:text-sm`}>Unsupported data visualization type.</p>;
  }
};

interface EditableTextInternalProps { // Renamed to avoid potential naming conflicts if file was named EditableText.tsx
  element: TextElementProps;
  defaultTextColor?: string;
  isEditing?: boolean;
  onContentChange?: (newContent: string) => void;
  onEditingComplete?: () => void;
}

const EditableText: React.FC<EditableTextInternalProps> = ({ 
  element, 
  defaultTextColor,
  isEditing = false,
  onContentChange,
  onEditingComplete 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [currentText, setCurrentText] = useState(element.content);

  useEffect(() => {
    setCurrentText(element.content); 
  }, [element.content]);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select(); 
    }
  }, [isEditing]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCurrentText(newText.replace(/\n/g, '<br>')); 
    if (onContentChange) {
      onContentChange(newText.replace(/\n/g, '<br>'));
    }
  };

  const handleBlur = () => {
    if (onContentChange) { 
      onContentChange(currentText);
    }
    if (onEditingComplete) {
      onEditingComplete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      handleBlur(); 
    }
  };

  const textStyle: React.CSSProperties = {
    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
    color: element.color || defaultTextColor,
    fontWeight: element.fontWeight || undefined,
    fontStyle: element.fontStyle || undefined,
    textDecoration: element.textDecoration || undefined,
    textAlign: element.textAlign || undefined,
    lineHeight: element.lineHeight || undefined,
    fontFamily: element.fontFamily || 'Inter, sans-serif',
    backgroundColor: element.backgroundColor || 'transparent', 
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap', 
    letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : undefined,
    textShadow: element.textShadow || undefined,
    paddingTop: `${element.paddingTop !== undefined ? element.paddingTop : 4}px`,
    paddingRight: `${element.paddingRight !== undefined ? element.paddingRight : 4}px`,
    paddingBottom: `${element.paddingBottom !== undefined ? element.paddingBottom : 4}px`,
    paddingLeft: `${element.paddingLeft !== undefined ? element.paddingLeft : 4}px`,
    opacity: element.opacity !== undefined ? element.opacity : 1,
  };

  if (isEditing) {
    const textareaStyle: React.CSSProperties = {
      ...textStyle,
      border: 'none',
      outline: 'none',
      resize: 'none',
      overflowY: 'auto', 
      position: 'absolute', 
      top: 0,
      left: 0,
    };
    return (
      <textarea
        ref={textareaRef}
        value={currentText.replace(/<br\s*\/?>/gi, '\n')} 
        onChange={handleTextChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={textareaStyle}
        className="bg-transparent focus:outline-none focus:ring-0" 
      />
    );
  }
  
  const textContent = (
    <>
      {element.isList ? (
        element.listType === 'number' ? (
          <ol style={{ listStylePosition: 'inside', margin: 0, padding: 0 }} className="list-decimal">
            {element.content.split('<br>').map((item, idx) => <li key={idx}>{item.replace(/^•\s*/, '').trim()}</li>)}
          </ol>
        ) : (
          <ul style={{ listStylePosition: 'inside', margin: 0, padding: 0 }} className="list-disc">
            {element.content.split('<br>').map((item, idx) => <li key={idx}>{item.replace(/^•\s*/, '').trim()}</li>)}
          </ul>
        )
      ) : (
        <div dangerouslySetInnerHTML={{ __html: element.content }} />
      )}
    </>
  );

  return (
    <div style={textStyle} className="break-words">
      {element.hyperlink ? (
        <a href={element.hyperlink} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
          {textContent}
        </a>
      ) : (
        textContent
      )}
    </div>
  );
};

const EditableImage: React.FC<{ element: ImageElementProps }> = ({ element }) => {
  return (
    <img
      src={element.src}
      alt={element.alt || 'Editable image'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: element.objectFit || 'contain',
        opacity: element.opacity !== undefined ? element.opacity : 1,
      }}
      onDragStart={(e) => e.preventDefault()}
    />
  );
};

const EditableChart: React.FC<{ element: ChartElementProps, defaultTextColor?: string }> = ({ element, defaultTextColor }) => {
  return (
    <div 
      className="w-full h-full flex items-center justify-center text-xs"
      style={{opacity: element.opacity !== undefined ? element.opacity : 1}}
    >
      {renderDataVisualization(element.chartProperties, element.chartProperties.title ? (defaultTextColor || '#FFFFFF') : (defaultTextColor || '#FFFFFF'))}
    </div>
  );
};

const EditableShape: React.FC<{ element: ShapeElementProps }> = ({ element }) => {
  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: element.fillColor || 'transparent',
    borderStyle: element.strokeWidth && element.strokeWidth > 0 ? 'solid' : 'none',
    borderColor: element.strokeColor || 'transparent',
    borderWidth: element.strokeWidth ? `${element.strokeWidth}px` : undefined,
    opacity: element.opacity !== undefined ? element.opacity : 1,
    boxSizing: 'border-box',
  };

  if (element.shapeType === 'rectangle') {
    return <div style={shapeStyle} />;
  }
  return <div style={shapeStyle} className="text-xs text-center text-slate-400 p-1">Unsupported Shape</div>;
};


interface EditableSlideViewProps {
  slide: Slide;
  isActive: boolean;
  selectedElementId?: string | null;
  onElementSelect: (elementId: string) => void;
  onElementUpdate: (updatedElement: SlideElement) => void;
}

const EditableSlideView: React.FC<EditableSlideViewProps> = ({ slide, isActive, selectedElementId, onElementSelect, onElementUpdate }) => {
  const { elements, background, defaultElementTextColor } = slide;
  const slideViewRef = useRef<HTMLDivElement>(null);
  const [parentDimensions, setParentDimensions] = useState<ParentDimensions | null>(null);

  useEffect(() => {
    const slideViewNode = slideViewRef.current;
    
    const updateDimensions = () => {
      if (slideViewNode) {
        setParentDimensions({
          width: slideViewNode.offsetWidth,
          height: slideViewNode.offsetHeight,
        });
      }
    };

    if (isActive && slideViewNode) {
      updateDimensions(); 
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(slideViewNode);
      return () => {
        resizeObserver.unobserve(slideViewNode);
        resizeObserver.disconnect();
      };
    } else if (isActive && !slideViewNode) {
      const timer = setTimeout(updateDimensions, 50); 
      return () => clearTimeout(timer);
    } else if (!isActive) {
        setParentDimensions(null);
    }

  }, [isActive, slide.id]);

  const backgroundStyle: React.CSSProperties = {};
  if (background.type === 'image' && background.value) {
    backgroundStyle.backgroundImage = `url(${background.value})`;
    backgroundStyle.backgroundSize = background.imageFit || 'cover';
    backgroundStyle.backgroundPosition = 'center';
  }

  const backgroundClasses = background.type === 'color' && background.value.startsWith('bg-')
    ? background.value
    : 'bg-slate-900';

  return (
    <div
      ref={slideViewRef}
      className={`aspect-[16/9] w-full shadow-2xl rounded-lg overflow-hidden relative ${backgroundClasses}
                  transition-all duration-300 ease-in-out
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      style={{ ...backgroundStyle, willChange: 'opacity, transform' }}
      aria-label={`Slide: ${slide.titleForThumbnail || 'Editable Slide'}`}
      role="group"
      onClick={(e) => {
        if (e.target === slideViewRef.current) {
          onElementSelect(''); 
        }
      }}
    >
      {isActive && parentDimensions && elements.map((element) => (
        <ElementWrapper
          key={element.id}
          element={element}
          isSelected={selectedElementId === element.id}
          onSelect={onElementSelect}
          onElementUpdate={onElementUpdate}
          parentSlideDimensions={parentDimensions}
          slideDefaultTextColor={defaultElementTextColor}
        >
          {element.type === 'text' && <EditableText element={element as TextElementProps} defaultTextColor={defaultElementTextColor} />}
          {element.type === 'image' && <EditableImage element={element as ImageElementProps} />}
          {element.type === 'chart' && <EditableChart element={element as ChartElementProps} defaultTextColor={defaultElementTextColor} />}
          {element.type === 'shape' && <EditableShape element={element as ShapeElementProps} />}
        </ElementWrapper>
      ))}
      {isActive && !parentDimensions && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none">
            Initializing slide editor...
        </div>
      )}
    </div>
  );
};

export default EditableSlideView;