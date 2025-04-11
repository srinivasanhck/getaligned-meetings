"use client"

import type React from "react"

import { useState } from "react"

interface DateRangePickerProps {
  onSelect: (startDate: Date, endDate: Date) => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelect }) => {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Get today's date for max date constraint
  const today = new Date()
  today.setHours(23, 59, 59, 999)

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
      const isPast = date < today
      const isSelected =
        (startDate && date.toDateString() === startDate.toDateString()) ||
        (endDate && date.toDateString() === endDate.toDateString())
      const isInRange = startDate && endDate && date > startDate && date < endDate

      days.push(
        <button
          key={day}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${isToday ? "font-bold" : ""} ${
            isSelected
              ? "bg-primary text-white"
              : isInRange
                ? "bg-primary/10 text-primary"
                : isPast
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
          }`}
          disabled={!isPast}
          onClick={() => {
            if (!isPast) return

            if (!startDate || (startDate && endDate)) {
              setStartDate(date)
              setEndDate(null)
            } else if (date < startDate) {
              setStartDate(date)
              setEndDate(startDate)
            } else {
              setEndDate(date)
            }
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
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    if (nextMonth <= today) {
      setCurrentMonth(nextMonth)
    }
  }

  const handleApply = () => {
    if (startDate && endDate) {
      // Set time to beginning and end of day
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      onSelect(start, end)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handlePrevMonth}
        >
          &lt;
        </button>
        <div className="text-sm font-medium">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          onClick={handleNextMonth}
          disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
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
          {startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : startDate
              ? `${startDate.toLocaleDateString()} - Select end date`
              : "Select start date"}
        </div>
        <button
          className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50"
          disabled={!startDate || !endDate}
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default DateRangePicker
