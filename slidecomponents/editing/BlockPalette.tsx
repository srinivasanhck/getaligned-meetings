"use client"

import type React from "react"

import type { BlockCategory, BlockDefinition } from "@/types"
import Icon from "../Icon"
import { DEFAULT_BLOCK_DEFINITIONS } from "@/constants"

interface BlockPaletteProps {
  onSelectBlock: (blockDefinition: BlockDefinition) => void
  onClose: () => void
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ onSelectBlock, onClose }) => {
  const categories: BlockCategory[] = ["Text", "List", "Media", "Layout", "Visuals"]

  const blocksByCategory: Record<BlockCategory, BlockDefinition[]> = categories.reduce(
    (acc, category) => {
      acc[category] = DEFAULT_BLOCK_DEFINITIONS.filter((block) => block.category === category)
      return acc
    },
    {} as Record<BlockCategory, BlockDefinition[]>,
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add Block</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Choose a content block to add to your slide
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {categories.map(
            (category) =>
              blocksByCategory[category] &&
              blocksByCategory[category].length > 0 && (
                <div key={category} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {blocksByCategory[category].map((block) => (
                      <button
                        key={block.id}
                        onClick={() => onSelectBlock(block)}
                        className="group flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-slate-200 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        title={block.description || block.label}
                      >
                        <div className="w-8 h-8 mb-3 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-shadow duration-200 border border-slate-200 dark:border-slate-600">
                          <Icon
                            name={block.icon}
                            className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                          {block.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  )
}

export default BlockPalette
