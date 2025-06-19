// Define shape types and their SVG paths or CSS properties

export interface ShapeDefinition {
  id: string
  name: string
  type: "svg" | "css"
  // For SVG shapes
  svgPath?: string
  viewBox?: string
  // For CSS shapes
  cssProperties?: Record<string, string>
}

// Basic shapes collection
export const basicShapes: ShapeDefinition[] = [
  {
    id: "rectangle",
    name: "Rectangle",
    type: "css",
    cssProperties: {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      border: "2px solid #000000", // Changed to black
    },
  },
  {
    id: "rounded-rectangle",
    name: "Rounded Rectangle",
    type: "css",
    cssProperties: {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      border: "2px solid #000000", // Changed to black
      borderRadius: "10px",
    },
  },
  {
    id: "circle",
    name: "Circle",
    type: "css",
    cssProperties: {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      border: "2px solid #000000", // Changed to black
      borderRadius: "50%",
    },
  },
  {
    id: "oval",
    name: "Oval",
    type: "css",
    cssProperties: {
      width: "100%",
      height: "100%",
      backgroundColor: "#ffffff",
      border: "2px solid #000000", // Changed to black
      borderRadius: "50%",
    },
  },
  {
    id: "triangle",
    name: "Triangle",
    type: "svg",
    svgPath: "M 50,0 L 100,100 L 0,100 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "right-triangle",
    name: "Right Triangle",
    type: "svg",
    svgPath: "M 0,0 L 100,100 L 0,100 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "trapezoid",
    name: "Trapezoid",
    type: "svg",
    svgPath: "M 20,0 L 80,0 L 100,100 L 0,100 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "pentagon",
    name: "Pentagon",
    type: "svg",
    svgPath: "M 50,0 L 100,38 L 82,100 L 18,100 L 0,38 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "hexagon",
    name: "Hexagon",
    type: "svg",
    svgPath: "M 25,0 L 75,0 L 100,50 L 75,100 L 25,100 L 0,50 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "star",
    name: "Star",
    type: "svg",
    svgPath: "M 50,0 L 61,35 L 98,35 L 68,57 L 79,91 L 50,70 L 21,91 L 32,57 L 2,35 L 39,35 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "arrow-right",
    name: "Arrow Right",
    type: "svg",
    svgPath: "M 0,40 L 60,40 L 60,20 L 100,50 L 60,80 L 60,60 L 0,60 Z",
    viewBox: "0 0 100 100",
  },
  {
    id: "speech-bubble",
    name: "Speech Bubble",
    type: "svg",
    svgPath: "M 0,0 L 100,0 L 100,75 L 75,75 L 50,100 L 50,75 L 0,75 Z",
    viewBox: "0 0 100 100",
  },
]

// Group shapes by category
export const shapeCategories = {
  basic: basicShapes.slice(0, 4),
  geometric: basicShapes.slice(4, 10),
  arrows: [basicShapes[10]],
  callouts: [basicShapes[11]],
}
