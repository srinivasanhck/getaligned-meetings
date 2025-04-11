export interface Attendee {
  email: string
  organizer: boolean
  responseStatus: string
  self: boolean
}

export interface MeetingTime {
  dateTime: string
  timeZone: string
}

export interface Meeting {
  kind: string
  etag: string
  id: string
  status: string
  summary: string
  htmlLink: string
  created: string
  updated: string
  creator: {
    email: string
    self: boolean
  }
  organizer: {
    email: string
    self: boolean
  }
  start: MeetingTime
  end: MeetingTime
  sequence: number
  reminders: {
    useDefault: boolean
  }
  eventType: string
  hangoutLink?: string
  meetingBot?: boolean
  meetingStatus?: "NotStarted" | "SummaryReady" | string
  recurringEventId?: string
  attendees: Attendee[]
  icalUID: string
}

export interface MeetingsResponse {
  kind: string
  etag: string
  summary: string
  description: string | null
  updated: string
  timeZone: string
  accessRole: string
  items: Meeting[]
  defaultReminders: {
    method: string
    minutes: number
  }[]
}
