import React, { useState, useEffect, useCallback } from 'react';
import { Presentation, Slide, SelectedElementInfo, SlideElement,  } from '@/types';
import EditableSlideView from './EditableSlideView';
import IconButton from './IconButton';
import SlideThumbnail from './SlideThumbnail';
import PropertyInspectorPanel from './editing/PropertyInspectorPanel';


interface PresentationViewerProps { // Changed interface name from PresentationEditorProps
  presentation: Presentation;
  onElementUpdate: (slideId: string, updatedElement: SlideElement) => void;
  onSlideUpdate: (updatedSlide: Slide) => void;
  onDeleteElement: (slideId: string, elementId: string) => void; // Added onDeleteElement
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ presentation, onElementUpdate, onSlideUpdate, onDeleteElement }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);

  const currentSlide = presentation[currentSlideIndex];

  const handleElementSelect = useCallback((elementId: string) => {
    if (currentSlide) {
      if (elementId === '') { // Clicked on slide background
        setSelectedElement(null);
      } else {
        setSelectedElement({ slideId: currentSlide.id, elementId });
      }
    } else {
        setSelectedElement(null);
    }
  }, [currentSlide]);

  useEffect(() => {
    // Deselect element if it's deleted from the current slide
    if (selectedElement && currentSlide) {
      const elementExists = currentSlide.elements.some(el => el.id === selectedElement.elementId);
      if (!elementExists) {
        setSelectedElement(null);
      }
    }
    // Deselect element if slide changes
    setSelectedElement(null);
  }, [currentSlideIndex, currentSlide, selectedElement]);


  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => Math.min(prevIndex + 1, presentation.length - 1));
  }, [presentation.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  }, []);
  
  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        goToNextSlide();
      } else if (event.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (event.key === 'Escape') {
        setSelectedElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextSlide, goToPrevSlide]);

  if (!presentation || presentation.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p>No presentation to display or edit.</p>
      </div>
    );
  }

  const selectedElementData = currentSlide?.elements.find(el => el.id === selectedElement?.elementId);

  // Placeholder delete handler for PresentationViewer as it doesn't manage full state
  const handleDeleteElementFromViewer = (slideId: string, elementId: string) => {
    console.warn(`Attempting to delete element ${elementId} from slide ${slideId} in PresentationViewer. This component might not fully support this action. Passing to parent if available.`);
    onDeleteElement(slideId, elementId); // Call the prop passed from parent
  };


  return (
    <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto mt-8 animate-slide-up">
      <div className="flex-grow relative mb-6 md:mb-0 md:mr-4">
        <div className="aspect-[16/9] w-full relative">
          {presentation.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-500 ease-in-out"
              style={{
                opacity: index === currentSlideIndex ? 1 : 0,
                pointerEvents: index === currentSlideIndex ? 'auto' : 'none',
                zIndex: index === currentSlideIndex ? 10 : 1, 
              }}
            >
              <EditableSlideView
                slide={slide}
                isActive={index === currentSlideIndex}
                selectedElementId={slide.id === selectedElement?.slideId ? selectedElement.elementId : null}
                onElementSelect={handleElementSelect}
                onElementUpdate={(updatedElement: SlideElement) => {
                  onElementUpdate(slide.id, updatedElement);
                }}
              />
            </div>
          ))}
        </div>
      
        <div className="flex items-center justify-between mt-4 px-2">
          <IconButton
            icon="arrowLeft"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:bg-slate-800"
            aria-label="Previous slide"
          />
          <span className="text-sm text-slate-400">
            Slide {currentSlideIndex + 1} of {presentation.length}
          </span>
          <IconButton
            icon="arrowRight"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === presentation.length - 1}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:bg-slate-800"
            aria-label="Next slide"
          />
        </div>
      </div>

      <div className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-slate-800 rounded-lg shadow-xl p-4 overflow-y-auto" style={{maxHeight: 'calc(16 / 9 * (100vw - 2rem - 1rem - 18rem) * 0.9)'}}>
        <PropertyInspectorPanel
          currentSlide={currentSlide}
          selectedElement={selectedElementData}
          onElementChange={(updatedElement) => {
            if (currentSlide && selectedElement) { 
              onElementUpdate(currentSlide.id, updatedElement);
            }
          }}
          onSlideUpdate={onSlideUpdate}
          onDeleteElement={handleDeleteElementFromViewer} // Pass the handler
        />
      </div>

      {presentation.length > 1 && (
         <div className="w-full md:w-auto md:order-first md:flex-col md:space-y-3 md:space-x-0 md:pr-3 overflow-y-auto md:max-h-[70vh] fixed left-4 top-24 hidden xl:flex">
            {presentation.map((slide, index) => (
              <div key={slide.id} className="md:w-40 w-32 flex-shrink-0">
                <SlideThumbnail
                  slide={slide} 
                  index={index}
                  isActive={index === currentSlideIndex}
                  onClick={() => goToSlide(index)}
                />
              </div>
            ))}
        </div>
      )}
       {presentation.length > 1 && (
         <div className="w-full overflow-x-auto pb-4 mt-4 xl:hidden">
            <div className="flex space-x-3 p-1">
            {presentation.map((slide, index) => (
              <div key={slide.id} className="flex-shrink-0 w-32 md:w-40">
                <SlideThumbnail
                  slide={slide}
                  index={index}
                  isActive={index === currentSlideIndex}
                  onClick={() => goToSlide(index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentationViewer;
