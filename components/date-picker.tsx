"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  onDateChange: (date: Date | undefined) => void
}

export function DatePicker({ onDateChange }: DatePickerProps) {
  const [date, setDate] = useState<Date>()

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onDateChange(selectedDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-8 text-xs px-2",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

