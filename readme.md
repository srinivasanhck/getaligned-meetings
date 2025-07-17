# NextJS GetAligned Meet Application 

## Overview
This is a Next.js 14 application for meeting management with integrated authentication, calendar access, HubSpot integration, and presentation generation capabilities.

## Quick Start

### Installation & Development
```bash
# Install dependencies
npm i

# Run development server
npm run dev
```

### Environment Configuration

#### **Local Development (.env)**
```env
NEXT_PUBLIC_COOKIE_DOMAIN=localhost
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_isLocalhost=true
```

#### **Production Deployment (.env)**
```env
NEXT_PUBLIC_COOKIE_DOMAIN=.getaligned.work
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_isLocalhost=false
```

#### **API Configuration (`lib/utils.ts`)**
```typescript
export const APIURL = process.env.NEXT_PUBLIC_API_URL;
export const APIURLINTEGRATION = process.env.NEXT_PUBLIC_API_BASE_URL;
export const CLIENTID = process.env.NEXT_PUBLIC_CLIENT_ID;
```

**⚠️ Important**: Update API URLs in `lib/utils.ts` when switching between local and production environments.



## Table of Contents
1. [Authentication](#authentication)
2. [Dashboard/Home Page](#dashboardhome-page)
3. [Upcoming Meetings](#upcoming-meetings)
4. [Next Steps](#next-steps)
5. [HubSpot Integration](#hubspot-integration)
6. [Presentation Generation](#presentation-generation)

---

## Authentication

### Overview
The application uses **Google OAuth 2.0** for authentication. The authentication token is stored in both **cookies** and **localStorage** for redundancy and reliability.

### Authentication Flow
1. User clicks "Sign in with Google" on login page
2. User is redirected to Google OAuth consent screen
3. After consent, Google redirects back to `/auth/callback` with authorization code
4. Application exchanges the code for access token via backend API
5. Token is stored in both cookies and localStorage
6. User is redirected to dashboard

### Key Files and Components

#### 1. **Authentication Pages** (`app/(auth)/`)
- **`login/page.tsx`** - Login page with Google sign-in button
- **`register/page.tsx`** - Registration page (if separate from login)
- **`auth/callback/`** - OAuth callback handling
  - `page.tsx` - Main callback page
  - `AuthCallbackClient.tsx` - Client component for processing OAuth callback
  - `loading.tsx` - Loading state during authentication

#### 2. **Authentication Context** (`contexts/`)
- **`AuthContext.tsx`** - Context API provider for authentication state
  - Manages: `isLoggedIn`, `token`, `email`, `hasCalendarAccess`
  - Provides: `checkCalendarAccess()`, `logout()` methods
  - Handles authentication state across the application

#### 3. **Authentication Services** (`services/`)
- **`authService.ts`** - Core authentication functions
  - `getGoogleAuthUrl()` - Generates Google OAuth URL
  - `handleAuthCallback()` - Processes OAuth callback
  - `isAuthenticated()` - Checks authentication status
  - `getToken()` - Retrieves token from cookie/localStorage
  - `getUserEmail()` - Gets user email
  - `checkUserScope()` - Verifies calendar access permissions
  - `logout()` - Clears authentication data

#### 4. **Authentication Components** (`components/auth/`)
- **`AuthLoadingScreen.tsx`** - Loading screen wrapper for auth state
- **`ProtectedRoute.tsx`** - HOC for protecting authenticated routes
- **`CalendarAccessPopup.tsx`** - Popup for requesting calendar permissions
- **`GmailAccessPopup.tsx`** - Popup for Gmail access permissions

#### 5. **Middleware** (`middleware.ts`)
- Route protection at middleware level
- Redirects unauthenticated users to `/login`
- Redirects authenticated users from `/login` to dashboard
- Public routes: `/login`, `/auth/callback`

#### 6. **API Integration** (`services/api.ts`)
- Axios instance with authentication interceptors
- Automatically adds Bearer token to all API requests
- Handles 401 errors by redirecting to login

### Authentication Storage
- **Cookie Name**: `getaligned_meeting_token`
- **Cookie Options**: 
  - Expiry: 365 days
  - Secure: true (in production)
- **LocalStorage Keys**: 
  - `getaligned_meeting_token` - Authentication token
  - `getaligned_meeting_email` - User email
  - `has_calendar_access` - Calendar access status

### Environment Variables
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_COOKIE_DOMAIN` - Cookie domain for production
- `NEXT_PUBLIC_NODE_ENV` - Environment (production/development)
- `NEXT_PUBLIC_isLocalhost` - Flag for local development

### Important Notes
1. Token is validated on every protected route access
2. Both cookie and localStorage are checked for token (fallback mechanism)
3. Calendar access is checked separately after authentication
4. Middleware handles initial route protection
5. AuthContext provides client-side authentication state

---

## Dashboard/Home Page

### Overview
The main dashboard displays a **two-panel layout** with a global sidebar for navigation. Left panel shows meetings list with infinite scrolling, right panel shows selected meeting details with three tabs.

### Layout Structure

#### **Global Sidebar** (`components/layout/sidebar.tsx`)
- **Location**: Fixed left side (16px width)
- **Navigation Items**:
  - Homepage (`/`) - Landing dashboard
  - Upcoming Meetings (`/upcoming`) - Future scheduled meetings  
  - Next Steps (`/next-steps`) - Task management
  - Integrations (`/integrations`) - Third-party connections
  - Create PPT (`/generate-ppt`) - Presentation builder
- **Auth Controls**: Settings, logout

#### **Main Dashboard Layout** (`app/page.tsx`, `app/meeting/[id]/page.tsx`)
- **Left Panel** (30% width): Meetings list with infinite scroll
- **Right Panel** (70% width): Meeting details with tabs
- **URL Structure**: `/meeting/{meetingId}` for direct access

### Meetings List Panel

#### **Core Component** (`components/dashboard/MeetingsList.tsx`)
- **Features**: 
  - Infinite scrolling (loads 30 days at a time)
  - Date range filtering with calendar picker
  - Meeting status indicators (Summary Ready, In Progress, Bot Restricted)
- **States**: Loading skeleton, error handling, empty state
- **Redux Integration**: `meetingsSlice.ts` for state management

#### **Meeting Card** (`components/dashboard/MeetingCard.tsx`)
- Displays: Title, time, duration, attendee avatars
- Status-based styling and clickability
- Direct meeting joining for active meetings

#### **Supporting Components**:
- `MeetingsListSkeleton.tsx` - Loading state
- `MeetingsListError.tsx` - Error handling
- `MeetingsListEmpty.tsx` - No meetings state
- `DateRangePicker.tsx` - Calendar filtering

### Meeting Details Panel

#### **Main Component** (`components/dashboard/MeetingDetails.tsx`)
- **Header**: Meeting title, time, attendees, join link
- **Three Tabs**: Summary, Deal Summary, Email
- **URL Integration**: Meeting ID in URL for direct access

#### **Tab Components**:

##### **1. Summary Tab** (`components/dashboard/tabs/SummaryTab.tsx`)
- **Keywords**: Meeting topic tags
- **Summary Points**: Bullet-point meeting overview  
- **Action Items**: Task assignments with completion tracking
- **Sales Evaluation**: Multi-category analysis with sub-tabs
- **Features**: HubSpot integration, video loading, task management

##### **2. Deal Summary Tab** (`components/dashboard/tabs/DealSummaryTab.tsx`)  
- **Two-Panel Layout**: Left content (main summary), Right tabs (categories)
- **Edit Mode**: Rich text editing with formatting toolbar
- **Export**: PDF download functionality
- **HubSpot Integration**: Content selection for CRM notes

##### **3. Email Tab** (`components/dashboard/tabs/EmailTab.tsx`)
- **Requirements**: Gmail scope authentication (separate token)
- **Features**: Email composition, template selection, recipient management
- **Integration**: Uses email service for template generation

#### **Shared Components**:
- `AskMeAnything.tsx` - AI chat interface
- `MeetingDetailsLoading.tsx` - Loading state
- `MeetingDetailsError.tsx` - Error handling

### Authentication Requirements
- **Calendar Access**: Required for meetings list and details
- **Email Access**: Additional scope needed for Email tab functionality
- **Token Management**: Separate tokens for calendar vs email permissions

### Key Files Structure
```
app/
├── page.tsx                          # Main dashboard
├── meeting/[id]/page.tsx             # Direct meeting access
└── (dashboard)/layout.tsx            # Dashboard wrapper

components/
├── layout/sidebar.tsx                # Global navigation
├── dashboard/
│   ├── MeetingsList.tsx             # Left panel meetings
│   ├── MeetingDetails.tsx           # Right panel wrapper
│   ├── MeetingCard.tsx              # Individual meeting item
│   └── tabs/
│       ├── SummaryTab.tsx           # Tab 1: Meeting overview
│       ├── DealSummaryTab.tsx       # Tab 2: Sales analysis
│       └── EmailTab.tsx             # Tab 3: Email composer
```

### Redux State Management
- **`meetingsSlice.ts`**: Meetings list, infinite scroll, filtering
- **`meetingDetailsSlice.ts`**: Selected meeting, tab data, loading states
- **URL Sync**: Meeting ID synchronized between URL and Redux

---

## Upcoming Meetings

### Overview
Displays future meetings from Google Calendar with filtering options and bot management capabilities.

### Core Functionality

#### **Main Page** (`app/(dashboard)/upcoming/page.tsx`)
- **Filter Options**: Today / Next 7 days dropdown
- **Calendar Access**: Requires Google Calendar permissions
- **States**: Loading, error, empty, calendar access required

#### **Data Fetching** (`services/upcomingMeetingsService.ts`)
- **Today Meetings**: From current time until end of day
- **Next 7 Days**: From current time for 7 days
- **API Integration**: Authenticated requests with error handling

#### **Display Components**

##### **Day Grouping** (`components/upcoming/DayMeetings.tsx`)
- Groups meetings by date (e.g., "Wednesday • 9 Apr")
- Displays meetings in card layout for each day

##### **Meeting Cards** (`components/upcoming/MeetingCard.tsx`)
- **Meeting Info**: Title, time, duration, attendee avatars
- **Bot Toggle**: Enable/disable meeting bot with loading states
- **Join Link**: Direct access to Google Meet/hangout
- **Bot Management**: Add/remove bot with status feedback

#### **Bot Management Features**
- **Add Bot**: Enables meeting recording and transcription
- **Remove Bot**: Disables bot from future meetings
- **Status Validation**: Prevents bot changes for past/started meetings
- **Error Handling**: Clear feedback for authorization issues

#### **Key Components Structure**
```
app/(dashboard)/upcoming/
└── page.tsx                    # Main upcoming meetings page

components/upcoming/
├── DayMeetings.tsx            # Date grouping wrapper
└── MeetingCard.tsx            # Individual meeting item

services/
└── upcomingMeetingsService.ts # API calls for meetings/bot
```

#### **Authentication Requirements**
- **Calendar Access**: Required to fetch upcoming meetings
- **Calendar Popup**: Shown when access is missing

---

## Next Steps

### Overview
Task management system displaying action items, blockers, and follow-ups from meetings with completion tracking and filtering.

### Core Functionality

#### **Main Page** (`app/(dashboard)/next-steps/page.tsx`)
- **Infinite Scrolling**: Loads tasks by month (going backwards)
- **Participant Filter**: Dropdown to filter by specific attendees
- **Task Completion**: Click-to-complete with API integration

#### **Data Management** (`lib/redux/features/nextStepsSlice.ts`)
- **Filtering**: Only shows tasks with `taskType.id = 5` and `taskStatus.id = 1`
- **Date Ranges**: Month-by-month pagination going backwards
- **Participant List**: Unique list of all task assignees
- **Completion Tracking**: Real-time status updates

#### **Task Display** (`components/next-steps/NextStepsList.tsx`)

##### **Grouping Strategy**
- **By Meeting**: Tasks grouped under their source meeting
- **Sort Order**: Newest meetings first, then by task creation
- **Meeting Info**: Title, date, organizer displayed per group

##### **Task Items**
- **Completion**: Circle icon → click to mark complete
- **Details**: Task title, description, assignee
- **Loading State**: Spinner during completion API call

#### **Filtering System** (`components/next-steps/ParticipantFilter.tsx`)
- **Search**: Type-ahead search for participant names
- **Selection**: Single participant or "All Participants"
- **State Management**: Redux-based filtering with URL persistence

#### **Supporting Components**
- **`NextStepsListSkeleton.tsx`**: Loading state with shimmer effects
- **`NextStepsListError.tsx`**: Error state with retry functionality  
- **`NextStepsListEmpty.tsx`**: Empty state when no tasks found

#### **Task Completion Flow**
1. User clicks circle icon next to task
2. Optimistic UI update (spinner shows)
3. API call to mark task complete
4. Task removed from list on success
5. Error handling with rollback on failure

#### **API Integration**
- **Fetch Tasks**: `/api/v1/meeting-bot/summary/filter-task`
- **Complete Task**: `/api/v1/meeting-transcript-summary/remove-task`
- **Date Format**: ISO strings with time boundaries

#### **Key Files Structure**
```
app/(dashboard)/next-steps/
├── page.tsx                   # Main next steps page
└── loading.tsx               # Loading state

components/next-steps/
├── NextStepsList.tsx         # Task list with grouping
├── ParticipantFilter.tsx     # Filter dropdown
├── NextStepsListSkeleton.tsx # Loading skeleton
├── NextStepsListError.tsx    # Error state
└── NextStepsListEmpty.tsx    # Empty state

lib/redux/features/
└── nextStepsSlice.ts         # Redux state management
```

#### **Redux State Management**
- **Tasks Array**: Filtered and grouped task data
- **Participants**: List of unique assignees for filtering
- **Completion Status**: Tracks which tasks are being completed
- **Pagination**: Date ranges for infinite scroll
- **Loading States**: Initial load, more loading, completion loading

---

## HubSpot Integration

### Overview
CRM integration that connects with HubSpot for contact management, deal creation, and note synchronization from meeting data.

### Authentication & Setup

#### **OAuth Flow** (`services/hubspotService.ts`)
- **Client ID**: `a2a70091-d3fc-45dc-a0b6-ea5b559d0eba`
- **Redirect URI**: `/integrations/hubspot/callback`
- **Required Scopes**:
  - `oauth`, `crm.objects.contacts.read/write`
  - `crm.objects.deals.read/write`
  - `crm.objects.companies.read/write`
  - `crm.schemas.*` permissions

#### **Connection Flow**
1. User clicks "Connect HubSpot" on integrations page
2. Redirected to HubSpot OAuth consent screen
3. After consent, redirected to callback page
4. Backend exchanges code for access token
5. Connection status stored and verified

### Main Features

#### **1. Integrations Page** (`app/(dashboard)/integrations/page.tsx`)
- **Connection Status**: Real-time check with HubSpot API
- **Connect Button**: Initiates OAuth flow when not connected
- **Manage Button**: Opens HubSpot dashboard when connected
- **Error Handling**: Connection failures and retry functionality

#### **2. HubSpot Dashboard** (`app/(dashboard)/integrations/hubspot/dashboard/page.tsx`)

##### **Contact Management**
- **Create Contacts**: Form with email, name, phone, company fields
- **List Contacts**: Displays all existing HubSpot contacts
- **Add Notes**: Attach notes to specific contacts
- **Bulk Operations**: Refresh contacts list

##### **Dashboard Features**
- **Contact Creation**: New contact form with validation
- **Contact List**: Paginated display with search
- **Note Addition**: Quick note attachment to contacts
- **External Link**: Direct access to HubSpot portal

#### **3. Meeting Integration Components**

##### **HubSpot Button** (`components/hubspot/HubspotButton.tsx`)
- **Location**: Appears in Summary and Deal Summary tabs
- **Menu Options**: Create Contact, Add Notes to Contact
- **Select Mode**: Click-to-select content for note creation
- **Connection Check**: Shows connect option when not authenticated

##### **Contact Creation** (`components/hubspot/HubspotContactPopup.tsx`)
- **Smart Extraction**: Parses meeting data to pre-fill contact forms
- **Customer Detection**: Automatically finds customer data in deal summaries
- **JSON/HTML Parsing**: Extracts structured data from meeting content
- **Multi-format Support**: Handles various data formats from meetings

##### **Deal Creation** (`components/hubspot/HubspotDealPopup.tsx`)
- **Deal Stages**: Pre-defined sales pipeline stages
- **Contact Association**: Link deals to existing contacts
- **Pipeline Management**: Default pipeline with customizable stages
- **Deal Types**: New Business vs Existing Business categorization

##### **Note Creation** (`components/hubspot/NotePopup.tsx`)
- **Contact Association**: Links notes to specific contacts
- **Rich Text Support**: Formatted note content
- **Meeting Context**: Notes can include meeting summaries or action items

### API Integration

#### **Core Services** (`services/hubspotService.ts`)
- **`getHubspotAuthUrl()`**: Generates OAuth authorization URL
- **`handleHubspotCallback()`**: Processes OAuth callback
- **`isHubspotConnected()`**: Checks connection status
- **`getAllHubspotContacts()`**: Fetches contact list
- **`createHubspotContact()`**: Creates new contacts
- **`createHubspotNote()`**: Adds notes to contacts
- **`createHubspotDeal()`**: Creates deals with associations

#### **Backend Endpoints**
- **`/api/v1/hubspot/callback`**: OAuth token exchange
- **`/api/v1/hubspot/checkConnection`**: Connection verification
- **`/api/v1/hubspot/allContacts`**: Contact retrieval
- **`/api/v1/hubspot/contact`**: Contact creation
- **`/api/v1/hubspot/createNote`**: Note creation
- **`/api/v1/hubspot/deal`**: Deal creation

### Data Flow & Usage

#### **Content Selection Mode**
1. User enables "Add Notes" mode in meeting tabs
2. Meeting content becomes clickable
3. Selected content pre-populates note creation
4. User selects target contact and saves note

#### **Smart Contact Creation**
1. System parses meeting content for customer data
2. Extracts names, emails, companies from summaries
3. Pre-fills contact creation form
4. User reviews and submits to HubSpot

#### **Deal Integration**
1. User creates deal from meeting context
2. Associates relevant meeting contacts
3. Sets pipeline stage and deal properties
4. Links deal to meeting participants

### Key Files Structure
```
app/(dashboard)/integrations/
├── page.tsx                          # Main integrations page
└── hubspot/
    ├── callback/page.tsx             # OAuth callback handler
    └── dashboard/page.tsx            # HubSpot management dashboard

components/hubspot/
├── HubspotButton.tsx                 # Integration trigger button
├── HubspotContactPopup.tsx           # Contact creation modal
├── HubspotDealPopup.tsx              # Deal creation modal
├── NotePopup.tsx                     # Note creation modal
└── DatePicker.tsx                    # Date selection utility

services/
└── hubspotService.ts                 # API integration service
```

### Error Handling & States
- **Connection Failures**: Retry mechanisms and user feedback
- **API Errors**: Detailed error messages and fallback options
- **Loading States**: Progressive loading for all operations
- **Validation**: Form validation before API submission
- **Duplicate Prevention**: Code tracking to prevent duplicate OAuth calls

---

## Presentation Generation

### Overview
Complete presentation creation system with AI-powered slide generation, real-time editing, and chat-based modifications.

### Generation Flow

#### **Phase 1: Generate PPT Page** (`app/(dashboard)/generate-ppt/page.tsx`)

##### **Two Generation Options**
1. **Chat Mode** - Prompt-based generation
   - Text input with example prompts
   - Presentation settings (pages, tone, audience)
   - Direct AI generation from description

2. **Meeting Mode** - Meeting-based generation
   - Meeting selection interface
   - File upload support
   - Custom instructions input
   - Batch processing multiple meetings

##### **Configuration Settings**
- **Pages**: Number of slides (5-20)
- **Tone**: Professional, Casual, Technical, Creative
- **Audience**: Executive, Technical, General, Students
- **Scenario**: Sales Pitch, Project Update, Training, etc.

#### **Phase 2: Outline Page** (`app/(dashboard)/generate-ppt/outline/[id]/page.tsx`)

##### **Outline Management**
- **Editable Structure**: Title and slide items
- **Drag & Drop**: Reorder slides with DnD Kit
- **CRUD Operations**: Add/Delete/Edit slides
- **Content Fields**:
  - `slideTitle`: Slide heading
  - `contentTopic`: What to cover
  - `visualTopic`: Visual elements description

##### **Actions Available**
- **Edit Content**: In-line editing of all fields
- **Template Selection**: Choose presentation theme
- **Generate Slides**: Initiate slide creation
- **Navigation**: Back to generator

##### **State Management**
- Redux store for outline data
- Local state for editing
- Auto-save to Redux on changes

#### **Phase 3: Presentations Page** (`app/(dashboard)/generate-ppt/presentations/[requestId]/page.tsx`)

##### **Real-Time Slide Generation**
```javascript
// Progressive slide generation flow:
1. Check for existing slides
2. If none, start real-time generation
3. Generate slide-by-slide with progress
4. Update UI as each slide completes
5. Auto-save to backend
```

##### **Slide Display & Editing**
- **Live Preview**: 16:9 aspect ratio canvas
- **Element Selection**: Click to select/edit
- **Property Inspector**: Right panel for element properties
- **Undo/Redo**: Full history management

##### **Advanced Features**
- **Background Editor**: Color, gradient, image backgrounds
- **Element Addition**: Text, images, charts, shapes
- **Drag & Drop**: Element positioning
- **Save System**: Auto-save with status indicators

### Slide Components Architecture

#### **Core Components** (`slidecomponents/`)

##### **1. PresentationEditor.tsx** - Main Editor Component
- **Layout**: Three-panel design (thumbnails, canvas, properties)
- **Features**:
  - Slide navigation and reordering
  - Element selection and editing
  - Chat integration panel
  - Save/Export functionality

##### **2. EditableSlideView.tsx** - Slide Canvas
- **Rendering**: Dynamic element positioning
- **Interactions**:
  - Click to select elements
  - Double-click to edit text
  - Drag to reposition
- **Background**: Preview support for testing

##### **3. ElementWrapper.tsx** - Element Container
- **Features**:
  - Resize handles
  - Rotation controls
  - Selection outline
  - Context menu
- **Positioning**: Percentage-based for responsiveness

##### **4. SlideElementRenderers.tsx** - Element Types
- **Text Elements**: Rich text editing, formatting
- **Image Elements**: Upload, URL, positioning
- **Chart Elements**: Data visualization
- **Shape Elements**: Basic shapes and icons

#### **Editing Components** (`slidecomponents/editing/`)

##### **1. PropertyInspectorPanel.tsx**
- **Element Properties**: Size, position, styling
- **Text Formatting**: Font, size, color, alignment
- **Image Controls**: Fit, opacity, borders
- **Slide Settings**: Background, transitions

##### **2. BlockPalette.tsx**
- **Element Library**: Draggable blocks
- **Categories**: Text, Media, Data, Shapes
- **Quick Add**: Click to add elements

##### **3. Upload Modals**
- **ImageUploadModal.tsx**: Image upload/URL
- **VideoUploadModal.tsx**: Video embedding

### Chat Agent System

#### **Chat Modes**
1. **Ask Mode** - General Q&A about presentations
2. **Agent Mode** - Direct slide modifications

#### **Agent Capabilities**
- **Content Updates**: Modify text, bullets, headings
- **Visual Changes**: Update images, colors, layouts
- **Structural Edits**: Add/remove elements
- **Bulk Operations**: Apply changes to multiple slides

#### **Implementation** (`slidecomponents/chatService.ts`)
```typescript
// Chat request structure
{
  slide_requests_id: string,
  agent_type: "ask" | "agent",
  prompt: string,
  slide_id?: string // For agent mode
}

// Response includes updated slides
{
  success: boolean,
  response: string,
  edited: boolean,
  updated_slides?: Slide[]
}
```

### State Management Flow

#### **Redux State** (`lib/redux/features/pptSlice.ts`)
```typescript
interface PptState {
  title: string
  outline: OutlineItem[]
  isGeneratingOutline: boolean
  selectedTemplate: string
  error: string | null
  slides: Slide[]
  loadingSlides: boolean
  groundingChunks?: any[]
}
```

#### **Data Flow**
1. **Generate Page** → Sets title, outline in Redux
2. **Outline Page** → Reads/updates outline from Redux
3. **Presentations Page** → Manages slides locally with backend sync

### API Integration

#### **Endpoints Used**
- **`/generate_presentation_outline`** - Create outline from input
- **`/v1/slides/initiate`** - Start slide generation
- **`/generate_slide_content`** - Generate individual slide
- **`/v1/slides/{requestId}`** - Get/Save slides
- **`/chat_with_ppt`** - Chat interactions

#### **Services**
- **`services/pptService.ts`** - Slide CRUD operations
- **`services/presentationService.ts`** - Generation logic
- **`services/geminiService.ts`** - AI content generation

### Key Files Structure
```
app/(dashboard)/generate-ppt/
├── page.tsx                          # Initial generation page
├── outline/[id]/page.tsx            # Outline editor
└── presentations/[requestId]/       
    └── page.tsx                     # Slide editor

components/ppt/
├── ExamplePrompts.tsx               # Prompt suggestions
├── PromptInput.tsx                  # Chat input interface
├── MeetingSelection.tsx             # Meeting picker
├── AllPresentationsList.tsx         # Previous presentations
├── SlideViewer.tsx                  # Read-only slide view
└── TemplateSelectionPopup.tsx       # Theme selector

slidecomponents/
├── PresentationEditor.tsx           # Main editor component
├── EditableSlideView.tsx            # Slide canvas
├── SlideElementRenderers.tsx        # Element renderers
├── SlideThumbnail.tsx              # Thumbnail view
├── chatService.ts                   # Chat API service
├── slideConverter.ts                # Data converters
└── editing/
    ├── ElementWrapper.tsx           # Element container
    ├── PropertyInspectorPanel.tsx   # Properties panel
    ├── BlockPalette.tsx            # Element library
    ├── ImageUploadModal.tsx        # Image upload
    └── VideoUploadModal.tsx        # Video upload

services/
├── pptService.ts                    # PPT CRUD operations
├── presentationService.ts           # Slide generation
└── geminiService.ts                # AI integration
```

### Technical Implementation Details

#### **Slide Generation Process**
1. **Outline Creation**: AI generates structured outline
2. **Request Initiation**: Create request_id for tracking
3. **Progressive Generation**: 
   - Generate slides one by one
   - Update UI immediately
   - Show progress indicators
4. **Background Save**: Auto-save after generation

#### **Real-Time Updates**
- **Optimistic UI**: Show changes immediately
- **Background Sync**: Save to backend asynchronously
- **Error Recovery**: Rollback on save failure

#### **Performance Optimizations**
- **Lazy Loading**: Load slides as needed
- **Memoization**: Cache expensive computations
- **Debouncing**: Limit save frequency
- **Virtual Scrolling**: For large presentations

### User Workflows

#### **Creating from Scratch**
1. Choose "Chat" option
2. Enter presentation description
3. Configure settings (pages, tone)
4. Generate outline
5. Review and edit outline
6. Generate slides
7. Edit and customize slides
8. Save/Export presentation

#### **Creating from Meetings**
1. Choose "Meetings" option
2. Select relevant meetings
3. Add custom instructions
4. Upload supporting files
5. Generate outline from meeting data
6. Follow same flow as above

#### **Editing with Chat Agent**
1. Open chat panel in editor
2. Select "Agent" mode
3. Type modification request
4. AI updates slide(s)
5. Review changes
6. Accept or request adjustments

### Error Handling
- **Generation Failures**: Retry mechanisms and fallbacks
- **Network Issues**: Offline capability for editing
- **Save Conflicts**: Version management
- **Invalid Content**: Validation and sanitization

---

