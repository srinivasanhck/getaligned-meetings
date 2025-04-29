"use client"

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  selectAllParticipants,
  selectSelectedParticipant,
  setSelectedParticipant,
} from "@/lib/redux/features/nextStepsSlice"
import { Check, ChevronDown, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"

export default function ParticipantFilter() {
  const dispatch = useAppDispatch()
  const participants = useAppSelector(selectAllParticipants)
  const selectedParticipant = useAppSelector(selectSelectedParticipant)
  const [displayText, setDisplayText] = useState("All Participants")
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Update display text when selected participant changes
  useEffect(() => {
    setDisplayText(selectedParticipant || "All Participants")
  }, [selectedParticipant])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleParticipantSelect = (participant: string | null) => {
    dispatch(setSelectedParticipant(participant))
    setIsOpen(false)
    setSearchQuery("")
  }

  // Filter participants based on search query
  const filteredParticipants = participants.filter((participant) =>
    participant.toLowerCase().startsWith(searchQuery.toLowerCase()),
  )

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between">
          <Users size={16} className="mr-2 text-muted-foreground" />
          <span className="truncate">{displayText}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full md:w-64 max-h-[300px] overflow-y-auto custom-scrollbar" align="end">
        {/* Search input */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search participants..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* All Participants option */}
        <DropdownMenuItem onClick={() => handleParticipantSelect(null)} className="flex items-center justify-between">
          <span>All Participants</span>
          {selectedParticipant === null && <Check className="h-4 w-4 ml-2" />}
        </DropdownMenuItem>

        {/* Filtered participants list */}
        {filteredParticipants.length > 0 ? (
          filteredParticipants.map((participant) => (
            <DropdownMenuItem
              key={participant}
              onClick={() => handleParticipantSelect(participant)}
              className="flex items-center justify-between"
            >
              <span className="truncate">{participant}</span>
              {selectedParticipant === participant && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          ))
        ) : searchQuery ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No matching participants
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No participants available
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
