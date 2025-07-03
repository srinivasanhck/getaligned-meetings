import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';

interface RegenerateSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (modificationPrompt: string) => void;
  currentSlideTitle?: string;
  isLoading: boolean;
}

const RegenerateSlideModal: React.FC<RegenerateSlideModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentSlideTitle,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrompt(''); // Reset prompt when modal opens
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div
        className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-100">
            Regenerate Slide: <span className="text-primary">{currentSlideTitle || 'Current Slide'}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 disabled:opacity-50"
            disabled={isLoading}
            aria-label="Close modal"
          >
            <Icon name="xCircle" className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="text-sm text-slate-300 mb-2">
            Describe the changes you'd like to make to this slide. For example:
          </p>
          <ul className="list-disc list-inside text-xs text-slate-400 mb-4 pl-2 space-y-1">
            <li>"Change the image to a futuristic cityscape."</li>
            <li>"Make the tone more optimistic and add a call to action."</li>
            <li>"Summarize this into three bullet points."</li>
            <li>"Replace the bar chart with a pie chart showing market share."</li>
          </ul>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            placeholder="e.g., Make the heading shorter and add a relevant statistic..."
            disabled={isLoading}
            required
            aria-label="Modification prompt for slide regeneration"
          />

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow-md transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Icon name="arrowPath" className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegenerateSlideModal;
