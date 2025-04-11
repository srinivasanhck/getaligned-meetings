export interface Meeting {
  id: number
  meetingUniqueId: string
  meetingTitle: string
  meetingDescription: string
  meetingLinkUrl: string
  organizer: string
  organizerUser: {
    userId: number
    google_user_id: string | null
    name: string
    picture: string
    emailAddress: string
  }
  meetingMode: string
  meetingStatus: string
  meetingBot: string | null
  meetingTasks: any | null
  tasks: any | null
  status: string | null
  location: string | null
  startTime: string
  startDay: string
  endDay: string
  localStartTime: string
  endTime: string
  localEndTime: string
  createdAt: string
  updatedAt: string
  recurrenceRule: string
  organization: {
    id: number
    name: string
    domain: string
    createdDate: string
    updatedDate: string
    users: any | null
  }
  attendees: Array<{
    id: number
    meetingId: number | null
    email: string
    displayName: string
    responseStatus: string
    comment: string | null
    isOptional: boolean
  }>
  hangoutLink: string
  recurringEventId: string
}

export interface TaskAssigned {
  participant: string
  tasks: string[]
  completedTasks: string[]
  toolSpecificTasks: Record<string, any>
}

export interface DealSummary {
  clientBackground: string
  currentStatus: string
  dealStage: string
  discoveryGap?: string[]
  discussion?: string
  keyPoints: string[]
  negativeSigns?: string[]
  nextSteps?: Array<{
    owner: string
    tasks: string[]
    timeline: string
  }>
  positiveSigns?: string[]
  pricingDiscussion?: {
    numericInsights: any[]
    pricingDetails: any[]
  }
  role?: string[]
  salesEvaluation?: {
    answeredQuestionsFully: boolean | null
    displayedEmpathy: boolean | null
    followUpCommitment: boolean
    improvementAreas: string[]
    listeningVsPitching: string | null
    nextStepsClarity: boolean
    objectionHandling: string | null
    overallPerformance: string | null
    salesMethodology: string[]
    salesProcess: string[]
    salesStrategy: string[]
    salesTactics: string[]
    salesTechniques: string[]
    salesTools: string[]
    solutionExplanationClarity: boolean | null
    understoodClientProblem: boolean
  }
  followUpOwner?: string
}

export interface MeetingDetails {
  totalAttendees: string[]
  dealSummary: DealSummary
  listSummary: string[]
  attendees: string[]
  keywords: string[]
  tasksAssigned: TaskAssigned[]
  meetingSummary: string
  meeting: Meeting
  salesEvaluation?: Record<string, any>
  transcript?: any[]
  meetingTranscriptLogs?: any[]
  blockers?: any[]
  completedYesterday?: any[]
  ideasShared?: any[]
  keyDecisions?: any[]
  meetingSummaryTaskDTO?: any
  overview?: any
  tasksWithStatus?: any[]
  todayPlan?: any[]
  updates?: any[]
}

// The API returns the MeetingDetails directly, not wrapped in a response object
export type MeetingDetailsResponse = MeetingDetails
