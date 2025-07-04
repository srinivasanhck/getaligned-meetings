import { useCallback, useRef, useState, useEffect } from 'react'
import type { Slide } from '@/types'

export interface HistoryAction {
  id: string
  type: 'element_update' | 'element_add' | 'element_delete' | 'slide_add' | 'slide_delete' | 'slide_reorder' | 'slide_update' | 'batch'
  description: string
  timestamp: number
  slideId?: string
  elementId?: string
  metadata?: Record<string, any>
}

export interface HistoryEntry {
  action: HistoryAction
  beforeState: Slide[]
  afterState: Slide[]
}

export interface UseUndoRedoOptions {
  maxHistorySize?: number
  groupingTimeWindow?: number // milliseconds to group similar actions
}

export interface UseUndoRedoReturn {
  // State
  canUndo: boolean
  canRedo: boolean
  currentAction: HistoryAction | null
  historySize: number
  
  // Actions
  executeAction: (action: HistoryAction, newState: Slide[]) => void
  undo: () => Slide[] | null
  redo: () => Slide[] | null
  clearHistory: () => void
  
  // Grouping control
  startGroup: (groupDescription: string) => void
  endGroup: () => void
}

const DEFAULT_OPTIONS: UseUndoRedoOptions = {
  maxHistorySize: 50,
  groupingTimeWindow: 1000, // 1 second
}

export function useUndoRedo(
  initialState: Slide[],
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  
  // Current state reference
  const currentStateRef = useRef<Slide[]>(initialState)
  
  // Update current state reference when initial state changes
  useEffect(() => {
    currentStateRef.current = initialState
  }, [initialState])
  
  // Grouping state
  const [isGrouping, setIsGrouping] = useState(false)
  const [groupActions, setGroupActions] = useState<HistoryAction[]>([])
  const [groupStartState, setGroupStartState] = useState<Slide[] | null>(null)
  const groupDescriptionRef = useRef<string>('')
  
  // Last action tracking for smart grouping
  const lastActionRef = useRef<HistoryAction | null>(null)
  const lastActionTimeRef = useRef<number>(0)
  
  // Computed properties
  const canUndo = currentIndex >= 0
  const canRedo = currentIndex < history.length - 1
  const currentAction = currentIndex >= 0 ? history[currentIndex]?.action : null
  const historySize = history.length
  
  // Helper to create deep copy of state
  const cloneState = useCallback((state: Slide[]): Slide[] => {
    return JSON.parse(JSON.stringify(state))
  }, [])
  
  // Helper to check if actions can be grouped
  const canGroupWithLastAction = useCallback((action: HistoryAction): boolean => {
    const now = Date.now()
    const lastAction = lastActionRef.current
    const timeDiff = now - lastActionTimeRef.current
    
    if (!lastAction || timeDiff > opts.groupingTimeWindow!) {
      return false
    }
    
    // Group text editing actions on the same element
    if (
      action.type === 'element_update' && 
      lastAction.type === 'element_update' &&
      action.slideId === lastAction.slideId &&
      action.elementId === lastAction.elementId &&
      action.metadata?.isTextEdit === true &&
      lastAction.metadata?.isTextEdit === true &&
      timeDiff < 2000 // 2 seconds for text editing
    ) {
      return true
    }
    
    return false
  }, [opts.groupingTimeWindow])
  
  // Start grouping multiple actions
  const startGroup = useCallback((groupDescription: string) => {
    if (isGrouping) {
      endGroup() // End previous group if exists
    }
    
    setIsGrouping(true)
    setGroupActions([])
    setGroupStartState(cloneState(currentStateRef.current))
    groupDescriptionRef.current = groupDescription
  }, [isGrouping, cloneState])
  
  // End grouping and create batch action
  const endGroup = useCallback(() => {
    if (!isGrouping || groupActions.length === 0) {
      setIsGrouping(false)
      setGroupActions([])
      setGroupStartState(null)
      return
    }
    
    const batchAction: HistoryAction = {
      id: `batch-${Date.now()}`,
      type: 'batch',
      description: groupDescriptionRef.current || `Batch of ${groupActions.length} actions`,
      timestamp: Date.now(),
      metadata: {
        actions: groupActions,
        actionCount: groupActions.length
      }
    }
    
    // Create history entry for the batch
    const entry: HistoryEntry = {
      action: batchAction,
      beforeState: groupStartState!,
      afterState: cloneState(currentStateRef.current)
    }
    
    // Add to history
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(entry)
      
      // Limit history size
      if (newHistory.length > opts.maxHistorySize!) {
        return newHistory.slice(-opts.maxHistorySize!)
      }
      
      return newHistory
    })
    
    setCurrentIndex(prev => {
      const newIndex = prev + 1
      return newIndex >= opts.maxHistorySize! ? opts.maxHistorySize! - 1 : newIndex
    })
    
    // Reset grouping state
    setIsGrouping(false)
    setGroupActions([])
    setGroupStartState(null)
    groupDescriptionRef.current = ''
    
    // Update last action tracking
    lastActionRef.current = batchAction
    lastActionTimeRef.current = Date.now()
  }, [isGrouping, groupActions, groupStartState, currentIndex, opts.maxHistorySize, cloneState])
  
  // Execute an action and add to history
  const executeAction = useCallback((action: HistoryAction, newState: Slide[]) => {
    const beforeState = cloneState(currentStateRef.current)
    const afterState = cloneState(newState)
    
    // Don't create history entry if state hasn't actually changed
    if (JSON.stringify(beforeState) === JSON.stringify(afterState)) {
      return
    }
    
    // Update current state
    currentStateRef.current = afterState
    
    // If we're grouping, add to group instead of history
    if (isGrouping) {
      setGroupActions(prev => [...prev, action])
      return
    }
    
    // Check if we can group with the last action
    const shouldGroup = canGroupWithLastAction(action)
    
    if (shouldGroup && currentIndex >= 0) {
      // Update the last history entry instead of creating a new one
      setHistory(prev => {
        const newHistory = [...prev]
        const lastEntry = newHistory[currentIndex]
        
        if (lastEntry) {
          // Update the "after" state and keep the original description but update timestamp
          lastEntry.afterState = afterState
          lastEntry.action = {
            ...lastEntry.action,
            description: action.description, // Use the latest description
            timestamp: action.timestamp
          }
        }
        
        return newHistory
      })
    } else {
      // Create new history entry
      const entry: HistoryEntry = {
        action,
        beforeState,
        afterState
      }
      
      // Remove any redo history when new action is performed
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push(entry)
        
        // Limit history size
        if (newHistory.length > opts.maxHistorySize!) {
          return newHistory.slice(-opts.maxHistorySize!)
        }
        
        return newHistory
      })
      
      setCurrentIndex(prev => {
        const newIndex = prev + 1
        return newIndex >= opts.maxHistorySize! ? opts.maxHistorySize! - 1 : newIndex
      })
    }
    
    // Update last action tracking
    lastActionRef.current = action
    lastActionTimeRef.current = Date.now()
  }, [currentIndex, opts.maxHistorySize, cloneState, canGroupWithLastAction, isGrouping])
  
  // Undo last action
  const undo = useCallback((): Slide[] | null => {
    if (!canUndo) return null
    
    const entry = history[currentIndex]
    if (!entry) return null
    
    // Prevent undoing past the initial state that has content
    const beforeState = entry.beforeState
    if (beforeState.length === 0 || beforeState.every(slide => slide.elements.length === 0)) {
      // Only allow undo if we have a previous state or if the current state is not the initial loaded state
      if (currentIndex === 0 && initialState.length > 0) {
        // This would take us to an empty state but we started with content, so don't allow it
        return null
      }
    }
    
    currentStateRef.current = cloneState(beforeState)
    setCurrentIndex(prev => prev - 1)
    
    return beforeState
  }, [canUndo, currentIndex, history, cloneState, initialState])
  
  // Redo next action
  const redo = useCallback((): Slide[] | null => {
    if (!canRedo) return null
    
    const entry = history[currentIndex + 1]
    if (!entry) return null
    
    currentStateRef.current = cloneState(entry.afterState)
    setCurrentIndex(prev => prev + 1)
    
    return entry.afterState
  }, [canRedo, currentIndex, history, cloneState])
  
  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
    lastActionRef.current = null
    lastActionTimeRef.current = 0
    
    // Clear any active grouping
    setIsGrouping(false)
    setGroupActions([])
    setGroupStartState(null)
  }, [])
  
  return {
    // State
    canUndo,
    canRedo,
    currentAction,
    historySize,
    
    // Actions
    executeAction,
    undo,
    redo,
    clearHistory,
    
    // Grouping
    startGroup,
    endGroup
  }
}
