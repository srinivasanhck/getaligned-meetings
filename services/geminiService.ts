import {
  SlideOutlineItem,
  PresentationOutline,
  Slide,
  Presentation,
  GroundingChunk,
  DataVisualization,
  SlideElement,
  TextElementProps,
  ImageElementProps,
  ChartElementProps,
  SlideBackground,
  ThemeStyle,
} from '../types';
import { ICON_MAP, DEFAULT_THEME, DYNAMIC_BACKGROUND_COLORS } from '../constants';
import { IconName } from "../slidecomponents/Icon";

// API base URL
const TEMPORARY_API_BASE_URL = 'https://api.getaligned.work/integration/api';

// Types for raw slide content
interface RawSlideContent {
  heading?: string;
  subheading?: string;
  paragraph?: string;
  bulletPoints?: string[];
  iconSuggestion?: string;
  imagePrompt?: string;
  imageUrl?: string;
  visualPlacement?: 'left' | 'right' | 'top' | 'background' | 'full' | 'none';
  dataVisualization?: DataVisualization;
  structuredContent?: { title: string; description: string; iconKeyword?: string }[];
  keyStats?: { value: string; label: string }[];
}

// Layout constants
const Gutter = 5; // % percentage for side gutters
const VisualTextGap = 4; // % percentage gap between visual and text areas

// Enhanced Padding and Minimum Height Constants
const DEFAULT_TEXT_PADDING = 18; // px
const LIST_TEXT_PADDING_LEFT = 28; // px (to accommodate bullet/number and space)

const HEADING_MIN_HEIGHT_PERCENT = 20; // Increased
const SUBHEADING_MIN_HEIGHT_PERCENT = 18; // Increased
const PARAGRAPH_MIN_HEIGHT_PERCENT = 30; // Increased significantly for up to 2-3 lines + padding
const STRUCTURED_ITEM_TITLE_MIN_HEIGHT_PERCENT = 20; // Increased
const STRUCTURED_ITEM_DESC_MIN_HEIGHT_PERCENT = 28; // Increased for ~2 lines + padding
const KEY_STAT_VALUE_MIN_HEIGHT_PERCENT = 22; // Increased for large font
const KEY_STAT_LABEL_MIN_HEIGHT_PERCENT = 16; // Increased

// Vertical Spacing constants (percentages of slide height)
const VERTICAL_SPACING_TITLE_SUBTITLE = 2.5;
const VERTICAL_SPACING_HEADING_SUBHEADING = 2.5;
const VERTICAL_SPACING_SUBHEADING_BODY = 4; // Increased
const VERTICAL_SPACING_HEADING_BODY = 5; // Increased
const VERTICAL_SPACING_BODY_ELEMENT = 6; // Increased for better block separation
const VERTICAL_SPACING_BODY_BOTTOM_MARGIN = 6; // Increased
const VERTICAL_SPACING_STRUCTURED_ITEM = 3.5; // Increased spacing between structured items

/**
 * Generate a presentation outline based on user input
 */
const generatePresentationOutline = async (
  userInput: string, 
  inputType: string, 
  useSearch: boolean
): Promise<{outline: PresentationOutline | null, groundingChunks: GroundingChunk[] | null}> => {
  try {
    const response = await fetch(`${TEMPORARY_API_BASE_URL}/generate_presentation_outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInput,
        inputType,
        useSearch,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to generate outline: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      outline: data.outline,
      groundingChunks: data.groundingChunks,
    };
  } catch (error) {
    console.error("Error generating presentation outline:", error);
    throw new Error(`Failed to generate presentation outline: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate an image with the given prompt
 */
async function generateImageWithPrompt(
  prompt: string, 
  onProgress: (message: string) => void
): Promise<string | null> {
  onProgress(`Generating image for prompt: "${prompt.substring(0, 40)}..."`);
  
  try {
    const response = await fetch(`${TEMPORARY_API_BASE_URL}/generate_image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      onProgress(errorData.error || `Image generation failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.imageBytes) {
      onProgress("Image generated successfully.");
      return data.imageBytes;
    }
    
    onProgress("Image generation returned no data.");
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    const errorDetails = String(error);
    let userMessage = "Image generation failed. ";

    if (errorDetails.includes("503") || errorDetails.toLowerCase().includes("unavailable")) {
      userMessage += "The image service is temporarily unavailable. The slide will proceed without this image. You can try regenerating later.";
    } else if (errorDetails.toLowerCase().includes("filtered") || errorDetails.toLowerCase().includes("safety policy")) {
      userMessage += "The image prompt may have been filtered due to safety policies. The image could not be generated.";
    } else if (error instanceof Error) {
      userMessage += `Details: ${error.message.substring(0, 80)}`;
    } else {
      userMessage += "An unknown error occurred.";
    }
    
    onProgress(userMessage);
    return null;
  }
}

/**
 * Generate raw content for a slide
 */
async function* generateRawSlideContentStream(
  presentationTopicSummary: string,
  slideTitle: string,
  contentTopic: string,
  visualTopic: string | undefined,
  useSearch: boolean,
  isFirstSlide: boolean,
  theme: ThemeStyle,
  modificationContext?: {
    existingContentSummary?: string;
    existingVisualSummary?: string;
    userModificationPrompt: string;
  }
): AsyncGenerator<Partial<RawSlideContent>, void, undefined> {
  try {
    const response = await fetch(`${TEMPORARY_API_BASE_URL}/generate_slide_content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentationTopicSummary,
        slideTitle,
        contentTopic,
        visualTopic,
        useSearch,
        isFirstSlide,
        theme,
        modificationContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to generate slide content: ${response.statusText}`);
    }

    const rawContent = await response.json();
    
    // Yield each property of the raw content individually to simulate streaming
    if (rawContent.heading) yield { heading: rawContent.heading };
    if (rawContent.subheading) yield { subheading: rawContent.subheading };
    if (rawContent.paragraph) yield { paragraph: rawContent.paragraph };
    if (rawContent.bulletPoints && rawContent.bulletPoints.length > 0) {
      for (const bullet of rawContent.bulletPoints) {
        yield { bulletPoints: [bullet] };
      }
    }
    if (rawContent.iconSuggestion) yield { iconSuggestion: rawContent.iconSuggestion };
    if (rawContent.imagePrompt) yield { imagePrompt: rawContent.imagePrompt };
    if (rawContent.imageUrl) yield { imageUrl: rawContent.imageUrl };
    if (rawContent.dataVisualization) yield { dataVisualization: rawContent.dataVisualization };
    if (rawContent.visualPlacement) yield { visualPlacement: rawContent.visualPlacement as RawSlideContent['visualPlacement'] };
    if (rawContent.structuredContent) yield { structuredContent: rawContent.structuredContent };
    if (rawContent.keyStats) yield { keyStats: rawContent.keyStats };
  } catch (error) {
    console.error("Error generating slide content:", error);
    throw new Error(`Failed to generate slide content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Map raw content to slide elements
 */
const mapRawContentToElements = (
  rawContent: RawSlideContent,
  slideId: string,
  isFirstSlide: boolean,
  theme: ThemeStyle
): SlideElement[] => {
  const elements: SlideElement[] = [];
  let elementIdCounter = 0;
  let currentY = isFirstSlide ? 25 : (Gutter + 5); 

  let textX = Gutter;
  let textWidth = 100 - 2 * Gutter;
  let textStartY = currentY;
  let headingTextAlign: TextElementProps['textAlign'] = 'center';
  let bodyTextAlign: TextElementProps['textAlign'] = 'left';

  let visualPlacedAsElement = false;
  const visualIsImage = !!rawContent.imageUrl;
  const visualIsChart = !!rawContent.dataVisualization;
  const hasVisual = visualIsImage || visualIsChart;

  if (isFirstSlide) {
      currentY = 30;
      if (rawContent.heading) {
          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: rawContent.heading,
              x: Gutter, y: currentY, width: 100 - 2*Gutter, height: HEADING_MIN_HEIGHT_PERCENT + 5, // Title slide heading might be larger
              fontSize: 40, fontWeight: 'bold', textAlign: 'center', zIndex: 10, locked: false, opacity: 1,
              color: theme.accentColorPrimary, semanticType: 'title',
              paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
              lineHeight: 1.4,
          } as TextElementProps);
          currentY += (HEADING_MIN_HEIGHT_PERCENT + 5) + VERTICAL_SPACING_TITLE_SUBTITLE;
      }
      if (rawContent.subheading) {
          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: rawContent.subheading,
              x: Gutter, y: currentY, width: 100 - 2*Gutter, height: SUBHEADING_MIN_HEIGHT_PERCENT,
              fontSize: 24, fontWeight: 'normal', textAlign: 'center', zIndex: 10, locked: false, opacity: 1,
              color: theme.subtitleTextColor, semanticType: 'heading2',
              paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
              lineHeight: 1.5,
          } as TextElementProps);
      }
      return elements;
  }

  // --- Content Slide Layout Logic ---
  let visualWidthPercent = 48; 
  let visualHeightPercent = 100 - 2 * (Gutter + 2); 
  let visualXPercent = Gutter;
  let visualYPercent = Gutter + 2; 
  let objectFit: ImageElementProps['objectFit'] = 'cover';

  const useFullBackgroundImage = hasVisual && (rawContent.visualPlacement === 'full' || rawContent.visualPlacement === 'background');

  if (useFullBackgroundImage && visualIsImage) {
      textX = Gutter + 12; 
      textWidth = 100 - 2 * (Gutter + 12); 
      textStartY = Math.max(currentY, 20); 
      headingTextAlign = 'center';
      bodyTextAlign = 'center';
  } else if (hasVisual && (rawContent.visualPlacement === 'left' || rawContent.visualPlacement === 'right')) {
      visualPlacedAsElement = true;
      if (rawContent.visualPlacement === 'left') {
          visualXPercent = Gutter;
          textX = Gutter + visualWidthPercent + VisualTextGap;
      } else { // right
          visualXPercent = 100 - Gutter - visualWidthPercent;
          textX = Gutter;
      }
      textWidth = 100 - (Gutter + visualWidthPercent + VisualTextGap + Gutter);
      textStartY = visualYPercent; 
      headingTextAlign = 'left';
      bodyTextAlign = 'left';
  } else if (hasVisual && rawContent.visualPlacement === 'top') {
      visualPlacedAsElement = true;
      visualWidthPercent = 100 - 2 * Gutter;
      visualHeightPercent = 30;
      visualXPercent = Gutter;
      visualYPercent = currentY;
      objectFit = 'cover';
      textX = Gutter;
      textWidth = 100 - 2 * Gutter;
      textStartY = visualYPercent + visualHeightPercent + VisualTextGap;
      headingTextAlign = 'center';
      bodyTextAlign = 'left';
  } else { 
      textX = Gutter + 5;
      textWidth = 100 - 2 * (Gutter + 5);
      textStartY = currentY; 
      headingTextAlign = 'center';
      bodyTextAlign = 'left';
  }

  currentY = textStartY; 

  if (visualPlacedAsElement) {
      if (rawContent.imageUrl) {
          console.log('Creating image element with URL:', rawContent.imageUrl);
          // Check if imageUrl is a full URL (starts with http) or base64 data
          const imageSrc = rawContent.imageUrl.startsWith('http') 
            ? rawContent.imageUrl 
            : `data:image/jpeg;base64,${rawContent.imageUrl}`;
          console.log('Final image src:', imageSrc);
          elements.push({ id: `${slideId}-el-${elementIdCounter++}`, type: 'image', src: imageSrc, alt: rawContent.imagePrompt || 'Generated image', x: visualXPercent, y: visualYPercent, width: visualWidthPercent, height: visualHeightPercent, objectFit: objectFit, zIndex: 5, locked: false, opacity: 1 } as ImageElementProps);
      } else if (rawContent.dataVisualization) {
          elements.push({ id: `${slideId}-el-${elementIdCounter++}`, type: 'chart', chartProperties: rawContent.dataVisualization, x: visualXPercent, y: visualYPercent, width: visualWidthPercent, height: visualHeightPercent, zIndex: 5, locked: false, opacity: 1 } as ChartElementProps);
      } else {
          console.log('No visual content to place. imageUrl:', rawContent.imageUrl, 'dataVisualization:', rawContent.dataVisualization);
      }
  } else {
      console.log('Visual not placed as element. visualPlacedAsElement:', visualPlacedAsElement);
  }

  // Add Heading
  if (rawContent.heading) {
      const headingHeight = HEADING_MIN_HEIGHT_PERCENT;
      elements.push({
          id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: rawContent.heading,
          x: textX, y: currentY, width: textWidth, height: headingHeight,
          fontSize: 36, fontWeight: 'bold', textAlign: headingTextAlign, zIndex: 10, locked: false, opacity: 1,
          color: theme.accentColorPrimary, semanticType: 'heading1',
          paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
          lineHeight: 1.3,
      } as TextElementProps);
      currentY += headingHeight + (rawContent.subheading ? VERTICAL_SPACING_HEADING_SUBHEADING : VERTICAL_SPACING_HEADING_BODY);
  }

  // Add Subheading
  if (rawContent.subheading) {
      const subheadingHeight = SUBHEADING_MIN_HEIGHT_PERCENT;
      elements.push({
          id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: rawContent.subheading,
          x: textX, y: currentY, width: textWidth, height: subheadingHeight,
          fontSize: 28, fontWeight: 'normal', textAlign: (bodyTextAlign === 'center' && useFullBackgroundImage) ? 'center' : 'left', zIndex: 10, locked: false, opacity: 1, 
          color: theme.subtitleTextColor, semanticType: 'heading2',
          paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
          lineHeight: 1.4,
      } as TextElementProps);
      currentY += subheadingHeight + VERTICAL_SPACING_SUBHEADING_BODY;
  }

  // Add Key Stats (if any)
  if (rawContent.keyStats && rawContent.keyStats.length > 0) {
      const numStats = rawContent.keyStats.length;
      const gapBetweenStats = VisualTextGap; 
      const totalGapWidthForKeyStats = (numStats - 1) * gapBetweenStats;
      const statContainerWidth = numStats > 0 ? (textWidth - totalGapWidthForKeyStats) / numStats : textWidth;
      
      const statValueHeight = KEY_STAT_VALUE_MIN_HEIGHT_PERCENT; 
      const statLabelHeight = KEY_STAT_LABEL_MIN_HEIGHT_PERCENT; 
      const totalStatBlockHeight = statValueHeight + statLabelHeight + 1; // +1 for small gap

      rawContent.keyStats.forEach((stat, index) => {
          const statX = textX + index * (statContainerWidth + gapBetweenStats);
          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: stat.value,
              x: statX, y: currentY, width: statContainerWidth, height: statValueHeight,
              fontSize: 52, fontWeight: 'bold', textAlign: 'center', zIndex: 10, locked: false, opacity: 1,
              color: theme.accentColorPrimary, semanticType: 'heading2', 
              paddingTop: 2, paddingBottom: 0, paddingLeft: 2, paddingRight: 2, lineHeight: 1,
          } as TextElementProps);
          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: stat.label,
              x: statX, y: currentY + statValueHeight, width: statContainerWidth, height: statLabelHeight,
              fontSize: 16, fontWeight: 'normal', textAlign: 'center', zIndex: 10, locked: false, opacity: 1,
              color: theme.bodyTextColor, semanticType: 'paragraph',
              paddingTop: 0, paddingBottom: DEFAULT_TEXT_PADDING / 2, paddingLeft: 2, paddingRight: 2, lineHeight: 1.3,
          } as TextElementProps);
      });
      currentY += totalStatBlockHeight + VERTICAL_SPACING_BODY_ELEMENT;
  }

  // Add Paragraph or Bullets or Structured Content
  const remainingHeightForBody = Math.max(0, 100 - currentY - VERTICAL_SPACING_BODY_BOTTOM_MARGIN);
  let bodyContentActualHeight = PARAGRAPH_MIN_HEIGHT_PERCENT; // Default min height

  if (rawContent.paragraph) {
      bodyContentActualHeight = Math.max(PARAGRAPH_MIN_HEIGHT_PERCENT, remainingHeightForBody);
      elements.push({
          id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: rawContent.paragraph,
          x: textX, y: currentY, width: textWidth, height: bodyContentActualHeight,
          fontSize: 18, fontWeight: 'normal', textAlign: bodyTextAlign, zIndex: 10, locked: false, opacity: 1,
          color: theme.bodyTextColor, semanticType: 'paragraph',
          paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
          lineHeight: 1.6,
      } as TextElementProps);
      currentY += bodyContentActualHeight + VERTICAL_SPACING_BODY_ELEMENT;
  } else if (rawContent.bulletPoints && rawContent.bulletPoints.length > 0) {
      bodyContentActualHeight = Math.max(PARAGRAPH_MIN_HEIGHT_PERCENT, remainingHeightForBody);
      const bulletsContent = rawContent.bulletPoints.join('<br>');
      elements.push({
          id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: bulletsContent,
          x: textX, y: currentY, width: textWidth, height: bodyContentActualHeight,
          fontSize: 18, fontWeight: 'normal', textAlign: bodyTextAlign, isList: true, listType: 'bullet', zIndex: 10, locked: false, opacity: 1,
          color: theme.bodyTextColor, semanticType: 'paragraph',
          paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: LIST_TEXT_PADDING_LEFT, paddingRight: DEFAULT_TEXT_PADDING,
          lineHeight: 1.6,
      } as TextElementProps);
      currentY += bodyContentActualHeight + VERTICAL_SPACING_BODY_ELEMENT;
  } else if (rawContent.structuredContent && rawContent.structuredContent.length > 0) {
      const numStructuredItems = rawContent.structuredContent.length;
      const minHeightPerItem = STRUCTURED_ITEM_TITLE_MIN_HEIGHT_PERCENT + STRUCTURED_ITEM_DESC_MIN_HEIGHT_PERCENT + VERTICAL_SPACING_STRUCTURED_ITEM;
      const totalMinHeightForAllItems = numStructuredItems * (STRUCTURED_ITEM_TITLE_MIN_HEIGHT_PERCENT + STRUCTURED_ITEM_DESC_MIN_HEIGHT_PERCENT) + (numStructuredItems -1) * VERTICAL_SPACING_STRUCTURED_ITEM;
      
      let availableHeightForStructuredContent = Math.max(totalMinHeightForAllItems, remainingHeightForBody);
      
      rawContent.structuredContent.forEach((item, index) => {
          const itemTitleHeight = STRUCTURED_ITEM_TITLE_MIN_HEIGHT_PERCENT;
          const itemDescHeight = STRUCTURED_ITEM_DESC_MIN_HEIGHT_PERCENT;
          
          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: item.title,
              x: textX, y: currentY, width: textWidth, height: itemTitleHeight,
              fontSize: 20, fontWeight: 'bold', textAlign: bodyTextAlign, zIndex: 10, locked: false, opacity: 1,
              color: theme.subtitleTextColor, semanticType: 'heading3', 
              paddingTop: DEFAULT_TEXT_PADDING, paddingBottom: DEFAULT_TEXT_PADDING / 2, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
              lineHeight: 1.3,
          } as TextElementProps);
          currentY += itemTitleHeight;

          elements.push({
              id: `${slideId}-el-${elementIdCounter++}`, type: 'text', content: item.description,
              x: textX, y: currentY, width: textWidth, height: itemDescHeight,
              fontSize: 16, fontWeight: 'normal', textAlign: bodyTextAlign, zIndex: 10, locked: false, opacity: 1,
              color: theme.bodyTextColor, semanticType: 'paragraph',
              paddingTop: DEFAULT_TEXT_PADDING / 2, paddingBottom: DEFAULT_TEXT_PADDING, paddingLeft: DEFAULT_TEXT_PADDING, paddingRight: DEFAULT_TEXT_PADDING,
              lineHeight: 1.5,
          } as TextElementProps);
          currentY += itemDescHeight + (index < numStructuredItems -1 ? VERTICAL_SPACING_STRUCTURED_ITEM : 0);
      });
      currentY += VERTICAL_SPACING_BODY_ELEMENT; 
  }

  return elements;
};

/**
 * Generate a full presentation
 */
export const generateFullPresentation = async (
  userInput: string,
  inputType: string,
  useSearch: boolean,
  onProgress: (message: string) => void,
  onPartialUpdate: (slide: Slide) => void
): Promise<{ presentation: Presentation | null, groundingChunks: GroundingChunk[] | null}> => {
  onProgress("Generating presentation outline...");
  const { outline: presentationOutline, groundingChunks } = await generatePresentationOutline(userInput, inputType, useSearch);

  if (!presentationOutline || presentationOutline.length === 0) {
    onProgress("Failed to generate outline.");
    if (useSearch && groundingChunks && groundingChunks.length > 0) {
      throw new Error("Failed to get a structured outline from the AI, even with search results. Please try rephrasing your input.");
    }
    return { presentation: null, groundingChunks };
  }

  const presentationTopicSummary = userInput.substring(0, 300) + (userInput.length > 300 ? "..." : "");
  const slides: Slide[] = [];
  const totalSlides = presentationOutline.length;
  const theme = DEFAULT_THEME;

  for (let i = 0; i < totalSlides; i++) {
    const item = presentationOutline[i];
    const slideId = `slide-${Date.now()}-${i}`;
    const isFirstSlide = i === 0;

    let currentRawContent: RawSlideContent = {
      heading: item.slideTitle,
      visualPlacement: 'none', 
    };

    let accumulatedParagraph = "";
    let accumulatedBulletPoints: string[] = [];
    let accumulatedStructuredContent: RawSlideContent['structuredContent'] = [];
    let accumulatedKeyStats: RawSlideContent['keyStats'] = [];

    let slideBackground: SlideBackground = {
      type: 'color',
      value: DYNAMIC_BACKGROUND_COLORS[i % DYNAMIC_BACKGROUND_COLORS.length],
      overlayOpacity: theme.overlayStyle?.backgroundColor ? parseFloat(String(theme.overlayStyle.backgroundColor).split(',')[3]) || 0.6 : 0.6,
    };

    let currentSlideForUpdate: Slide = {
      id: slideId,
      elements: [],
      background: { ...slideBackground },
      defaultElementTextColor: theme.bodyTextColor,
      titleForThumbnail: item.slideTitle,
    };
    onPartialUpdate({ ...currentSlideForUpdate });

    onProgress(`Generating content for slide ${i + 1}: ${item.slideTitle}`);

    const rawContentStream = generateRawSlideContentStream(
      presentationTopicSummary,
      item.slideTitle,
      item.contentTopic,
      item.visualTopic,
      useSearch,
      isFirstSlide,
      theme
    );

    for await (const contentPart of rawContentStream) {
      console.log('Received content part:', contentPart);
      if (contentPart.heading !== undefined) currentRawContent.heading = contentPart.heading;
      if (contentPart.subheading !== undefined) currentRawContent.subheading = contentPart.subheading;
      if (contentPart.imagePrompt !== undefined) currentRawContent.imagePrompt = contentPart.imagePrompt;
      if (contentPart.imageUrl !== undefined) {
        console.log('Received imageUrl:', contentPart.imageUrl);
        currentRawContent.imageUrl = contentPart.imageUrl;
      }
      if (contentPart.dataVisualization !== undefined) currentRawContent.dataVisualization = contentPart.dataVisualization;
      if (contentPart.visualPlacement !== undefined) currentRawContent.visualPlacement = contentPart.visualPlacement;
      if (contentPart.iconSuggestion !== undefined) currentRawContent.iconSuggestion = contentPart.iconSuggestion;

      if (contentPart.paragraph) {
        accumulatedParagraph = (accumulatedParagraph ? accumulatedParagraph + " " : "") + contentPart.paragraph;
        currentRawContent.paragraph = accumulatedParagraph.trim();
      }
      if (contentPart.bulletPoints && contentPart.bulletPoints[0]) {
        accumulatedBulletPoints.push(contentPart.bulletPoints[0]);
        currentRawContent.bulletPoints = [...accumulatedBulletPoints];
      }
      if (contentPart.structuredContent) {
        accumulatedStructuredContent = [...(currentRawContent.structuredContent || []), ...contentPart.structuredContent];
        currentRawContent.structuredContent = accumulatedStructuredContent;
      }
      if (contentPart.keyStats) {
        accumulatedKeyStats = [...(currentRawContent.keyStats || []), ...contentPart.keyStats];
        currentRawContent.keyStats = accumulatedKeyStats;
      }

      currentSlideForUpdate.titleForThumbnail = currentRawContent.heading || item.slideTitle;
      currentSlideForUpdate.elements = mapRawContentToElements(currentRawContent, slideId, isFirstSlide, theme);
      onPartialUpdate({ ...currentSlideForUpdate });
    }

    // Image generation is already handled by the Flask API
    // No need to generate images again here

    let imageUsedForSlideBackground = false;
    if (currentRawContent.imageUrl) {
      if (isFirstSlide && currentRawContent.visualPlacement === 'background') {
        imageUsedForSlideBackground = true;
      } else if (!isFirstSlide && (currentRawContent.visualPlacement === 'full' || currentRawContent.visualPlacement === 'background')) {
        imageUsedForSlideBackground = true;
      }

      if (imageUsedForSlideBackground) {
        slideBackground.type = 'image';
        // Check if imageUrl is a full URL (starts with http) or base64 data
        slideBackground.value = currentRawContent.imageUrl.startsWith('http') 
          ? currentRawContent.imageUrl 
          : `data:image/jpeg;base64,${currentRawContent.imageUrl}`;
        slideBackground.imageFit = 'cover';
        currentRawContent.imageUrl = undefined; // Mark as used for background
      }
    }
    currentSlideForUpdate.background = { ...slideBackground };

    onProgress(`Finalizing slide ${i + 1}`);
    console.log('Final currentRawContent before mapping:', currentRawContent);
    currentSlideForUpdate.elements = mapRawContentToElements(currentRawContent, slideId, isFirstSlide, theme);
    console.log('Created elements:', currentSlideForUpdate.elements);
    currentSlideForUpdate.titleForThumbnail = currentRawContent.heading || item.slideTitle;
    currentSlideForUpdate.defaultElementTextColor = theme.bodyTextColor;

    if (currentRawContent.iconSuggestion) {
      const lowerIconKeyword = currentRawContent.iconSuggestion.toLowerCase().trim();
      let foundIconName: IconName | undefined = ICON_MAP[lowerIconKeyword];
      if (!foundIconName) {
        const keywordParts = lowerIconKeyword.split(/\s+/);
        for (const part of keywordParts) { if (ICON_MAP[part]) { foundIconName = ICON_MAP[part]; break; }}
      }
      if (!foundIconName) {
        const foundKey = Object.keys(ICON_MAP).find(k => lowerIconKeyword.includes(k));
        if (foundKey) { foundIconName = ICON_MAP[foundKey]; }
      }
      const defaultIcon = (currentRawContent.imageUrl || imageUsedForSlideBackground) ? 'photo' : (currentRawContent.dataVisualization ? 'chartBar' : 'documentText');
      currentSlideForUpdate.iconNameForThumbnail = foundIconName || defaultIcon;
    } else {
      currentSlideForUpdate.iconNameForThumbnail = (currentRawContent.imageUrl || imageUsedForSlideBackground) ? 'photo' : (currentRawContent.dataVisualization ? 'chartBar' : 'documentText');
    }

    onPartialUpdate({ ...currentSlideForUpdate });
    slides.push({...currentSlideForUpdate});
  }

  onProgress("Presentation generated successfully!");
  return { presentation: slides, groundingChunks };
};

/**
 * Regenerate a single slide
 */
export const regenerateSingleSlide = async (
  currentSlide: Slide,
  modificationPrompt: string,
  useSearch: boolean,
  onProgress: (message: string) => void,
  theme: ThemeStyle
): Promise<Partial<Slide>> => {
  onProgress(`Regenerating slide: ${currentSlide.titleForThumbnail || currentSlide.id}...`);

  try {
    const response = await fetch(`${TEMPORARY_API_BASE_URL}/regenerate_slide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentSlide,
        modificationPrompt,
        useSearch,
        theme,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to regenerate slide: ${response.statusText}`);
    }

    const data = await response.json();
    
    onProgress("Slide regeneration complete.");
    return data;
  } catch (error) {
    console.error("Error regenerating slide:", error);
    throw new Error(`Failed to regenerate slide: ${error instanceof Error ? error.message : String(error)}`);
  }
};
