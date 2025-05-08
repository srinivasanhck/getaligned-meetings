"use client"

import type React from "react"
import { useState } from "react"

interface DatePickerProps {
  onSelect: (date: Date) => void
  initialDate?: Date | null
}

const DatePicker: React.FC<DatePickerProps> = ({ onSelect, initialDate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get today's date for min date constraint
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Generate days for the current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      const isFuture = date >= today
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <button
          key={day}
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isToday ? "font-bold" : ""} ${
            isSelected
              ? "bg-primary text-white"
              : isFuture
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-400 hover:bg-gray-100"
          }`}
          onClick={() => {
            setSelectedDate(date)
            onSelect(date)
          }}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handlePrevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))
  }

  const handleNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))
  }

  return (
    <div className="w-full bg-white rounded-md shadow-lg border border-gray-200 p-3">
      {/* Year navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handlePrevYear}
          type="button"
        >
          &lt;&lt;
        </button>
        <div className="text-sm font-medium">{currentMonth.toLocaleDateString("en-US", { year: "numeric" })}</div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handleNextYear}
          type="button"
        >
          &gt;&gt;
        </button>
      </div>

      {/* Month navigation */}
      <div className="mb-2 flex items-center justify-between">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handlePrevMonth}
          type="button"
        >
          &lt;
        </button>
        <div className="text-sm font-medium">{currentMonth.toLocaleDateString("en-US", { month: "long" })}</div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handleNextMonth}
          type="button"
        >
          &gt;
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-xs text-gray-500">
          {selectedDate ? selectedDate.toLocaleDateString() : "No date selected"}
        </div>
      </div>
    </div>
  )
}

export default DatePicker
