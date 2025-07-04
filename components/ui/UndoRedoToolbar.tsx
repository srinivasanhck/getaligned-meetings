import React from 'react'
import { Undo2, Redo2 } from 'lucide-react'
import type { HistoryAction } from '@/hooks/useUndoRedo'

interface UndoRedoToolbarProps {
  canUndo: boolean
  canRedo: boolean
  currentAction: HistoryAction | null
  onUndo: () => void
  onRedo: () => void
  className?: string
}

const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  currentAction,
  onUndo,
  onRedo,
  className = ''
}) => {
  const getActionDescription = (action: HistoryAction | null): string => {
    if (!action) return ''
    
    // For text edits, use the description directly since it now contains the actual text
    if (action.type === 'element_update' && action.description.startsWith('Edit:')) {
      return action.description
    }
    
    switch (action.type) {
      case 'element_update':
        return `Update ${action.description}`
      case 'element_add':
        return `Add ${action.description}`
      case 'element_delete':
        return `Delete ${action.description}`
      case 'slide_add':
        return 'Add slide'
      case 'slide_delete':
        return 'Delete slide'
      case 'slide_reorder':
        return 'Reorder slides'
      case 'slide_update':
        return `Update ${action.description}`
      case 'batch':
        return action.description
      default:
        return action.description
    }
  }

  const undoTooltip = canUndo ? `Undo: ${getActionDescription(currentAction)}` : 'Nothing to undo'
  const redoTooltip = canRedo ? 'Redo next action' : 'Nothing to redo'

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          p-2 rounded-md border transition-all duration-200 
          ${canUndo 
            ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        title={undoTooltip}
        aria-label={undoTooltip}
      >
        <Undo2 className="h-4 w-4" />
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          p-2 rounded-md border transition-all duration-200
          ${canRedo 
            ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
        title={redoTooltip}
        aria-label={redoTooltip}
      >
        <Redo2 className="h-4 w-4" />
      </button>

      {/* History indicator - removed as requested */}
    </div>
  )
}

export default UndoRedoToolbar
