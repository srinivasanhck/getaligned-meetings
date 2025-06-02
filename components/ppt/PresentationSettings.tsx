"use client"

import { SettingsDropdown } from "./SettingsDropdown"

interface PresentationSettingsProps {
  pages: string
  tone: string
  audience: string
  scenario: string
  onPagesChange: (value: string) => void
  onToneChange: (value: string) => void
  onAudienceChange: (value: string) => void
  onScenarioChange: (value: string) => void
}

export function PresentationSettings({
  pages,
  tone,
  audience,
  scenario,
  onPagesChange,
  onToneChange,
  onAudienceChange,
  onScenarioChange,
}: PresentationSettingsProps) {
  return (
    <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2" style={{ zIndex: 50 }}>
        <SettingsDropdown
          label="No. of pages"
          options={["3-5", "5-10", "10-15", "15-20", "20+"]}
          value={pages}
          onChange={onPagesChange}
        />
        <SettingsDropdown
          label="Tone"
          options={["General", "Formal", "Casual", "Persuasive", "Informative"]}
          value={tone}
          onChange={onToneChange}
        />
        <SettingsDropdown
          label="Audience"
          options={["General", "Executives", "Technical", "Sales", "Marketing", "Customers"]}
          value={audience}
          onChange={onAudienceChange}
        />
        <SettingsDropdown
          label="Scenario"
          options={["General", "Meeting", "Conference", "Training", "Sales Pitch"]}
          value={scenario}
          onChange={onScenarioChange}
        />
      </div>
    </div>
  )
}
