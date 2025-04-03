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
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  sequence: number
  reminders: {
    useDefault: boolean
  }
  eventType: string
  hangoutLink?: string
  meetingBot?: boolean
  meetingStatus?: string
  recurringEventId?: string
  attendees?: {
    email: string
    organizer: boolean
    responseStatus: string
    self: boolean
  }[]
  icalUID: string
}

export interface MeetingData {
  kind: string
  etag: string
  summary: string
  description: null
  updated: string
  timeZone: string
  accessRole: string
  items: Meeting[]
  defaultReminders: {
    method: string
    minutes: number
  }[]
}

export interface MeetingDetail {
  totalAttendees: string[]
  dealSummary: {
    attendees: string[]
    challenges: string[]
    dealSummary: {
      challenges: string[]
      clientBackground: string
      clientPainPoints: string[]
      competitorInsights: string[]
      decisionMakers: string[]
      followUpActions: string[]
      keyConcerns: string[]
      nextSteps: string[]
      objections: string[]
      potentialOpportunities: string[]
      solutionsDiscussed: string[]
      tasks: {
        deadline: string | null
        owner: string
        task: string
      }[]
    }
    keyTakeaways: string[]
    keywords: string[]
    meetingPurpose: string
    meetingType: string
  }
  listSummary: string[]
  attendees: string[]
  keywords: string[]
  tasksAssigned: {
    participant: string
    tasks: string[]
    completedTasks: string[]
    toolSpecificTasks: Record<string, any>
  }[]
  meetingSummary: string
  meeting: {
    id: number
    meetingUniqueId: string
    meetingTitle: string
    meetingDescription: string
    meetingLinkUrl: string
    organizer: string
    organizerUser: {
      userId: number
      google_user_id: null
      name: string
      picture: string
      emailAddress: string
    }
    meetingMode: string
    meetingStatus: string
    startTime: string
    localStartTime: string
    endTime: string
    localEndTime: string
    createdAt: string
    updatedAt: string
    recurrenceRule: string
    hangoutLink: string
    conferenceData: string
    recurringEventId: string
  }
}

