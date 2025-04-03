import type { MeetingData, MeetingDetail } from "./types"

export const mockMeetingData: MeetingData = {
  kind: "calendar#events",
  etag: '"p33nodr4epu9oo0o"',
  summary: "aman@cleankoding.com",
  description: null,
  updated: "2025-03-18T12:21:30.957Z",
  timeZone: "Asia/Kolkata",
  accessRole: "owner",
  items: [
    {
      kind: "calendar#event",
      etag: '"3477802788910000"',
      id: "5lqq1cg05hemr7nqa45ae10013_20250324T040000Z",
      status: "confirmed",
      summary: "Daily Standup",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NWxxcTFjZzA1aGVtcjducWE0NWFlMTAwMTNfMjAyNTAzMjRUMDQwMDAwWiBhbWFuQGNsZWFua29kaW5nLmNvbQ",
      created: "2025-01-24T06:12:55.000Z",
      updated: "2025-02-07T04:09:54.455Z",
      creator: {
        email: "pradeep.s@cleankoding.com",
        self: false,
      },
      organizer: {
        email: "pradeep.s@cleankoding.com",
        self: false,
      },
      start: {
        dateTime: "2025-03-24T09:30:00+05:30",
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: "2025-03-24T10:00:00+05:30",
        timeZone: "Asia/Kolkata",
      },
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
      hangoutLink: "https://meet.google.com/hzk-cnas-zdw",
      meetingBot: true,
      meetingStatus: "NotStarted", // Not SummaryReady, so show Join Meeting button
      recurringEventId: "5lqq1cg05hemr7nqa45ae10013",
      attendees: [
        {
          email: "ketan.jangid@cleankoding.com",
          organizer: false,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "ayush.shetty@cleankoding.com",
          organizer: false,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "aman@cleankoding.com",
          organizer: false,
          responseStatus: "needsAction",
          self: true,
        },
        {
          email: "pradeep.s@cleankoding.com",
          organizer: true,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "srinivasan.h@cleankoding.com",
          organizer: false,
          responseStatus: "needsAction",
          self: false,
        },
      ],
      icalUID: "5lqq1cg05hemr7nqa45ae10013@google.com",
    },
    {
      kind: "calendar#event",
      etag: '"3477802788910001"',
      id: "5lqq1cg05hemr7nqa45ae10013_20250323T040000Z",
      status: "confirmed",
      summary: "Daily Standup",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NWxxcTFjZzA1aGVtcjducWE0NWFlMTAwMTNfMjAyNTAzMjNUMDQwMDAwWiBhbWFuQGNsZWFua29kaW5nLmNvbQ",
      created: "2025-01-24T06:12:55.000Z",
      updated: "2025-02-07T04:09:54.455Z",
      creator: {
        email: "pradeep.s@cleankoding.com",
        self: false,
      },
      organizer: {
        email: "pradeep.s@cleankoding.com",
        self: false,
      },
      start: {
        dateTime: "2025-03-23T09:30:00+05:30",
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: "2025-03-23T10:00:00+05:30",
        timeZone: "Asia/Kolkata",
      },
      sequence: 1,
      reminders: {
        useDefault: true,
      },
      eventType: "default",
      hangoutLink: "https://meet.google.com/hzk-cnas-zdw",
      meetingBot: true,
      meetingStatus: "SummaryReady", // SummaryReady, so don't show Join Meeting button
      recurringEventId: "5lqq1cg05hemr7nqa45ae10013",
      attendees: [
        {
          email: "ketan.jangid@cleankoding.com",
          organizer: false,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "aman@cleankoding.com",
          organizer: false,
          responseStatus: "needsAction",
          self: true,
        },
        {
          email: "pradeep.s@cleankoding.com",
          organizer: true,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "srinivasan.h@cleankoding.com",
          organizer: false,
          responseStatus: "needsAction",
          self: false,
        },
        {
          email: "harish.kumar@cleankoding.com",
          organizer: false,
          responseStatus: "accepted",
          self: false,
        },
        {
          email: "surya.upadhya@cleankoding.com",
          organizer: false,
          responseStatus: "accepted",
          self: false,
        },
      ],
      icalUID: "5lqq1cg05hemr7nqa45ae10013@google.com",
    },
  ],
  defaultReminders: [
    {
      method: "popup",
      minutes: 10,
    },
  ],
}

export const mockMeetingDetails: MeetingDetail = {
  totalAttendees: ["Ketan Jangid", "Ayush Shetty", "Srinivasan H", "Harish Kumar", "Suryanarayana S Upadhya"],
  dealSummary: {
    attendees: [
      "Pradeep Sreeram",
      "Ketan Jangid",
      "Ayush Shetty",
      "Srinivasan H",
      "Harish Kumar",
      "Suryanarayana S Upadhya",
    ],
    challenges: [
      "Harish faced issues with email scraping due to an update in Apollo's interface.",
      "Srinivasan mentioned drag and drop functionality is not currently working as expected.",
    ],
    dealSummary: {
      challenges: [
        "Issues with integrating drag-and-drop functionality for attaching screenshots.",
        "Need for approval from the HR team before using the proposed tool.",
      ],
      clientBackground:
        "The client is looking to improve their workflow efficiency through the use of automation tools, particularly for integrating various processes in their organization. Their primary goal is to implement solutions that simplify task management and communication.",
      clientPainPoints: [
        "Current tools are not effectively meeting their needs for workflow automation.",
        "Integration issues with existing systems.",
      ],
      competitorInsights: ["The client mentioned they cannot use any node maker tools due to company policy."],
      decisionMakers: ["Ketan Jangid", "Harish Kumar"],
      followUpActions: ["Review completed code once shared by Ayush Shetty."],
      keyConcerns: ["Need for compliance with company policies on tool usage."],
      nextSteps: ["Await HR approval for tool usage.", "Review and complete the code discussed in the meeting."],
      objections: ["Concerns about permissions from the HR team regarding tool usage."],
      potentialOpportunities: [
        "Enhancing user experience through improved task management features.",
        "Potential for increased engagement with marketing efforts.",
      ],
      solutionsDiscussed: [
        "Integration of a drag-and-drop feature in their current task management system.",
        "Utilizing automation tools for better workflow management.",
      ],
      tasks: [
        {
          deadline: null,
          owner: "Srinivasan H",
          task: "Finish implementing the drag-and-drop feature for attachments.",
        },
        {
          deadline: "2023-10-20",
          owner: "Suryanarayana S Upadhya",
          task: "Finalize filtering of companies in the sales and marketing sector.",
        },
        {
          deadline: "2023-10-20",
          owner: "Harish Kumar",
          task: "Reach out to 500 marketing managers this week.",
        },
      ],
    },
    keyTakeaways: [
      "Ayush is completing the code conversion from Python to Spring Boot with expected completion by tomorrow.",
      "Srinivasan has completed the tagging feature and is working on push notifications.",
      "Harish reported issues with scraping managers' details due to interface updates.",
      "Suryanarayana is filtering companies to help with user engagement and customer acquisition.",
    ],
    keywords: [
      "n8n",
      "python",
      "spring boot",
      "tagging feature",
      "notifications",
      "email marketing",
      "data filtering",
      "user engagement",
    ],
    meetingPurpose: "Review ongoing projects and updates from team members",
    meetingType: "Internal Strategy Meeting",
  },
  listSummary: [
    "Ketan discussed the integration of Slack triggers into workflows using N8N.",
    "Ayush is converting code from Python to Spring Boot and aims to complete it by tomorrow; code review will follow.",
    "Srinivasan completed the tagging feature and is working on push notifications, but faced delays due to a teammate's absence.",
    "Harish reported issues with scraping manager details due to an interface update and will send out messages tomorrow.",
    "Surya is filtering companies for marketing and aims to complete this task by the next standup.",
  ],
  attendees: [
    "Pradeep Sreeram",
    "Ketan Jangid",
    "Ayush Shetty",
    "Srinivasan H",
    "Harish Kumar",
    "Suryanarayana S Upadhya",
  ],
  keywords: ["Tagging feature", "Code Review", "Drag and Drop", "Scraping issues", "User Notifications"],
  tasksAssigned: [
    {
      participant: "Ketan Jangid",
      tasks: ["Write the code to extract data using N8N for Slack triggers."],
      completedTasks: [],
      toolSpecificTasks: {},
    },
    {
      participant: "Srinivasan H",
      tasks: ["Develop and finalize the drag and drop feature for attachments in the application."],
      completedTasks: [],
      toolSpecificTasks: {},
    },
    {
      participant: "Suryanarayana S Upadhya",
      tasks: [
        "Complete filtering of companies in the sales and marketing sector to help users improve customer acquisition.",
      ],
      completedTasks: [],
      toolSpecificTasks: {},
    },
    {
      participant: "Ayush Shetty",
      tasks: ["Finish converting the code from Python to Spring Boot, addressing errors in JSON mapping."],
      completedTasks: [],
      toolSpecificTasks: {},
    },
    {
      participant: "Harish Kumar",
      tasks: ["Contact 500 marketing managers this week and assess the results."],
      completedTasks: [],
      toolSpecificTasks: {},
    },
  ],
  meetingSummary:
    "• Ketan discussed the integration of Slack triggers into workflows using N8N.\n\n• Ayush is converting code from Python to Spring Boot and aims to complete it by tomorrow; code review will follow.\n\n• Srinivasan completed the tagging feature and is working on push notifications\n• but faced delays due to a teammate's absence.\n\n• Harish reported issues with scraping manager details due to an interface update and will send out messages tomorrow.\n\n• Surya is filtering companies for marketing and aims to complete this task by the next standup.",
  meeting: {
    id: 1874,
    meetingUniqueId: "0j4gjhktjgafjm8rd9mdop7k4t_20250303T133000Z",
    meetingTitle: "Daily Standup",
    meetingDescription: "Daily Standup",
    meetingLinkUrl:
      "https://www.google.com/calendar/event?eid=MGo0Z2poa3RqZ2Fmam04cmQ5bWRvcDdrNHRfMjAyNTAzMDNUMTMzMDAwWiBwcmFkZWVwLnNAY2xlYW5rb2RpbmcuY29t",
    organizer: "pradeep.s@cleankoding.com",
    organizerUser: {
      userId: 91,
      google_user_id: null,
      name: "Pradeep Sreeram",
      picture: "https://lh3.googleusercontent.com/a/ACg8ocIGAOiinhu3dVoeVL9RzgUKiFZHm_qtG6xEmVT279aTBjKtGA=s96-c",
      emailAddress: "pradeep.s@cleankoding.com",
    },
    meetingMode: "Google Meet",
    meetingStatus: "SummaryReady",
    startTime: "2025-03-03T13:30:00.000+00:00",
    localStartTime: "2025-03-03T19:00:00",
    endTime: "2025-03-03T14:00:00.000+00:00",
    localEndTime: "2025-03-03T19:30:00",
    createdAt: "2025-02-06T22:39:56.054+00:00",
    updatedAt: "2025-02-06T22:39:56.054+00:00",
    recurrenceRule: "0j4gjhktjgafjm8rd9mdop7k4t",
    hangoutLink: "https://meet.google.com/hzk-cnas-zdw",
    conferenceData: "hzk-cnas-zdw",
    recurringEventId: "0j4gjhktjgafjm8rd9mdop7k4t",
  },
}

