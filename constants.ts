
import { IconName } from "./slidecomponents/Icon";
import { BlockDefinition, TextElementProps, ImageElementProps, ShapeElementProps, TableElementProps, VideoElementProps, DividerElementProps, ButtonElementProps, CodeElementProps, ThemeStyle } from "@/types";

export const APP_TITLE = "AI Presentation Generator";
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002";

export const DEFAULT_PROMPT = "Create a 5-slide presentation on the future of renewable energy. Focus on solar, wind, and geothermal. Include a title slide, one slide for each energy type, and a concluding slide with a call to action.";

export const DYNAMIC_BACKGROUND_COLORS: string[] = [
  '#004e92', // deep blue
  '#2C2C3C', // charcoal
  '#3E4C59', // slate gray
  '#1A1F36', // midnight indigo
  '#4A6572', // cool gray
  '#394867', // blue steel
  '#2F3C4F', // dark slate blue
  '#1E2A3B', // very dark blue
  'bg-gradient-to-br from-slate-800 via-slate-900 to-black', // Default dark gradient
  'bg-gradient-to-tr from-sky-700 via-indigo-800 to-purple-900', // Cool vibrant
  'bg-gradient-to-bl from-gray-700 via-gray-900 to-black', // Monochromatic dark
];

export const PREDEFINED_GRADIENTS: {name: string, value: string}[] = [
  { name: "Slate Default", value: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black' },
  { name: "Cool Sky", value: 'bg-gradient-to-tr from-sky-700 via-indigo-800 to-purple-900' },
  { name: "Deep Space", value: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' },
  { name: "Oceanic Teal", value: 'bg-gradient-to-r from-teal-700 to-cyan-800' },
  { name: "Midnight Purple", value: 'bg-gradient-to-br from-purple-800 to-indigo-900' },
  { name: "Forest Green", value: 'bg-gradient-to-br from-green-800 to-emerald-900'},
  { name: "Monochromatic Gray", value: 'bg-gradient-to-bl from-gray-700 via-gray-900 to-black' },
];


export const DEFAULT_THEME: ThemeStyle = {
  name: "Dynamic Dark Visual",
  accentColorPrimary: '#00BCD4', // Cyan (Used for titles and primary accents)
  subtitleTextColor: '#E5E7EB',   // Slate 200 (For H2/subheadings)
  bodyTextColor: '#D1D5DB',       // Slate 300 (For paragraphs, lists)
  isDarkTheme: true,
  overlayStyle: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, // Default overlay for AI generated images
};

export const CHART_COLORS = [ 
  '#00BCD4', 
  '#84CC16', 
  '#FFC107', 
  '#EC4899', 
  '#3B82F6', 
  '#A855F7', 
  '#F59E0B', 
  '#10B981', 
];


export const ICON_MAP: Record<string, IconName> = {
  idea: 'lightbulb',
  innovation: 'lightbulb',
  concept: 'lightbulb',
  spark: 'sparkles',
  automation: 'cog',
  process: 'cog',
  settings: 'cog',
  tool: 'wrenchScrewdriver',
  build: 'buildingOffice2',
  success: 'checkCircle',
  achieve: 'checkCircle',
  complete: 'checkCircle',
  problem: 'xCircle',
  issue: 'xCircle',
  challenge: 'exclamationTriangle',
  warning: 'exclamationTriangle',
  alert: 'exclamationTriangle',
  info: 'informationCircle',
  information: 'informationCircle',
  question: 'questionMarkCircle',
  search: 'magnifyingGlass',
  find: 'magnifyingGlass',
  data: 'chartBar',
  analysis: 'chartPie',
  analytics: 'chartPie',
  statistic: 'chartBar',
  growth: 'arrowTrendingUp',
  finance: 'currencyDollar',
  money: 'currencyDollar',
  budget: 'banknotes',
  report: 'documentText',
  document: 'documentText',
  strategy: 'target',
  plan: 'target',
  goal: 'target',
  objective: 'target',
  team: 'users',
  people: 'users',
  user: 'userGroup',
  customer: 'userGroup',
  collaboration: 'userGroup',
  communication: 'chatBubbleLeftRight',
  discuss: 'chatBubbleLeftRight',
  meeting: 'calendarDays',
  schedule: 'calendarDays',
  contact: 'envelope',
  email: 'envelope',
  support: 'lifebuoy',
  help: 'lifebuoy',
  feature: 'bolt',
  capability: 'bolt',
  benefit: 'gift',
  value: 'gift',
  product: 'archiveBox',
  service: 'archiveBox',
  solution: 'academicCap',
  security: 'shieldCheck',
  secure: 'shieldCheck',
  cloud: 'cloudArrowUp',
  upload: 'cloudArrowUp',
  check: 'checkCircle',
  star: 'star',
  favorite: 'star',
  heart: 'heart',
  like: 'heart',
  time: 'clock',
  duration: 'clock',
  location: 'mapPin',
  place: 'mapPin',
  next: 'arrowRight',
  previous: 'arrowLeft',
  action: 'bolt',
  positive: 'checkCircle',
  negative: 'xCircle',
  neutral: 'informationCircle',
  image: 'photo', // Added generic image keyword
  picture: 'photo',
  visual: 'photo',
};

// Default Block Definitions
export const DEFAULT_BLOCK_DEFINITIONS: BlockDefinition[] = [
  // Text Category
  { id: 'text-title', type: 'text', label: 'Title', icon: 'heading', category: 'Text', semanticType: 'title', defaultProps: { content: "Presentation Title", fontSize: 40, fontWeight: 'bold', textAlign: 'center', height: 15, color: DEFAULT_THEME.accentColorPrimary } as Partial<TextElementProps> },
  { id: 'text-h1', type: 'text', label: 'Heading 1', icon: 'heading', category: 'Text', semanticType: 'heading1', defaultProps: { content: "Main Heading", fontSize: 36, fontWeight: 'bold', height: 12, color: DEFAULT_THEME.accentColorPrimary } as Partial<TextElementProps> },
  { id: 'text-h2', type: 'text', label: 'Heading 2', icon: 'heading', category: 'Text', semanticType: 'heading2', defaultProps: { content: "Subheading", fontSize: 28, fontWeight: 'normal', height: 10, color: DEFAULT_THEME.subtitleTextColor } as Partial<TextElementProps> },
  { id: 'text-paragraph', type: 'text', label: 'Paragraph', icon: 'documentText', category: 'Text', semanticType: 'paragraph', defaultProps: { content: "This is a new paragraph. You can edit this text.", fontSize: 18, fontWeight: 'normal', height: 20, color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  { id: 'text-quote', type: 'text', label: 'Quote', icon: 'quote', category: 'Text', semanticType: 'quote', defaultProps: { content: "Inspiring quote here.", fontSize: 22, fontStyle: 'italic', fontWeight: 'normal', textAlign: 'center', height: 15, color: DEFAULT_THEME.bodyTextColor, paddingTop: 10, paddingBottom:10 } as Partial<TextElementProps> },

  // List Category
  { id: 'list-bullet', type: 'text', label: 'Bullet List', icon: 'listBullet', category: 'List', listType: 'bullet', defaultProps: { content: "Item 1<br>Item 2", isList: true, fontSize: 18, fontWeight: 'normal', height: 15, color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  { id: 'list-number', type: 'text', label: 'Numbered List', icon: 'listNumber', category: 'List', listType: 'number', defaultProps: { content: "First item<br>Second item", isList: true, fontSize: 18, fontWeight: 'normal', height: 15, color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  // { id: 'list-todo', type: 'text', label: 'To-do List', icon: 'listTodo', category: 'List', listType: 'todo', defaultProps: { content: "[ ] Task 1<br>[ ] Task 2", isList: true, fontSize: 18, fontWeight: 'normal', height: 15, color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },

  // Callouts (Text Category or own category)
  { id: 'callout-info', type: 'text', label: 'Info Callout', icon: 'calloutInfo', category: 'Text', calloutType: 'info', defaultProps: { content: "Important information.", height: 18, fontSize: 16, fontWeight: 'normal', color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  { id: 'callout-warning', type: 'text', label: 'Warning Callout', icon: 'calloutWarning', category: 'Text', calloutType: 'warning', defaultProps: { content: "Be careful with this.", height: 18, fontSize: 16, fontWeight: 'normal', color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  { id: 'callout-tip', type: 'text', label: 'Tip Callout', icon: 'calloutTip', category: 'Text', calloutType: 'tip', defaultProps: { content: "Here's a helpful tip.", height: 18, fontSize: 16, fontWeight: 'normal', color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },
  { id: 'callout-success', type: 'text', label: 'Success Callout', icon: 'calloutSuccess', category: 'Text', calloutType: 'success', defaultProps: { content: "Action completed successfully!", height: 18, fontSize: 16, fontWeight: 'normal', color: DEFAULT_THEME.bodyTextColor } as Partial<TextElementProps> },

  // Media Category
  { id: 'media-image', type: 'image', label: 'Image', icon: 'photo', category: 'Media', defaultProps: { src: "https://via.placeholder.com/400x300.png?text=Add+Image", alt: "Placeholder Image", width: 50, height: 37.5, objectFit: 'contain' } as Partial<ImageElementProps> },
  { id: 'media-video', type: 'video', label: 'Video', icon: 'video', category: 'Media', defaultProps: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", videoType: 'youtube', controls: true, width:50, height: 28.125 } as Partial<VideoElementProps> }, // 16:9 default

  // Layout Category
  { id: 'layout-divider', type: 'divider', label: 'Divider', icon: 'line', category: 'Layout', defaultProps: { dividerStyle: 'solid', color: '#6B7280', thickness: 1, width: 80, height: 1 } as Partial<DividerElementProps> },
  { id: 'layout-table', type: 'table', label: 'Table', icon: 'table', category: 'Layout', initialTableRows: 3, initialTableCols: 3, defaultProps: { width: 60, height: 30 } as Partial<TableElementProps> },

  // Visuals Category (can include shapes, charts)
  { id: 'shape-rectangle', type: 'shape', label: 'Rectangle', icon: 'rectangle', category: 'Visuals', shapeType: 'rectangle', defaultProps: { fillColor: DEFAULT_THEME.accentColorPrimary, width: 30, height: 20 } as Partial<ShapeElementProps> },
  // Chart blocks can be added here if a default chart type is desired from palette
  // { id: 'chart-bar', type: 'chart', label: 'Bar Chart', icon: 'chartBar', category: 'Visuals', defaultProps: { ... } },

  // Advanced Category
  { id: 'advanced-button', type: 'button', label: 'Button', icon: 'button', category: 'Advanced', defaultProps: { text: "Click Here", buttonStyle: 'primary', width: 25, height: 8, cornerRadius: 6 } as Partial<ButtonElementProps> },
  { id: 'advanced-code', type: 'code', label: 'Code Block', icon: 'code', category: 'Advanced', defaultProps: { codeContent: `console.log("Hello World!");`, language: 'javascript', theme: 'dark', showLineNumbers: true, width: 60, height: 25 } as Partial<CodeElementProps> },
];
