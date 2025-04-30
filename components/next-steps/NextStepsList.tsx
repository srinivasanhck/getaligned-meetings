"use client"

import type React from "react"
import { Circle, Loader } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { completeTask, selectCompletingTasks } from "@/lib/redux/features/nextStepsSlice"
import type { AppDispatch } from "@/lib/redux/store"
import { useToast } from "@/components/ui/toast"

interface TaskStatus {
  id: number
  taskStatusName: string
  taskStatus: string | null
  stateOrder: number
  auditNotes: string
}

interface TaskType {
  id: number
  taskType: string
}

interface Meeting {
  id: number
  meetingUniqueId: string
  meetingTitle: string
  meetingDescription: string
  meetingLinkUrl: string
  organizer: string
  startTime?: string
  endTime?: string
}

interface Task {
  id: number
  title: string
  description: string
  meetingParticipant: string
  assignedBy: string | null
  emailAddress: string | null
  createdDate: string
  updatedDate: string
  taskType: TaskType
  taskStatus: TaskStatus
  meeting: Meeting
  // Add other fields as needed
}

interface NextStepsListProps {
  tasks: Task[]
  lastTaskElementRef: React.RefObject<HTMLDivElement>
}

export default function NextStepsList({ tasks, lastTaskElementRef }: NextStepsListProps) {
  const dispatch = useDispatch<AppDispatch>()
  const completingTasks = useSelector(selectCompletingTasks)
  const { showToast } = useToast()

  // Handle task completion
  const handleCompleteTask = async (task: Task) => {
    if (completingTasks[task.id]) return // Prevent multiple clicks

    try {
      const resultAction = await dispatch(
        completeTask({
          taskId: task.id,
          meetingId: task.meeting.meetingUniqueId,
          participant: task.meetingParticipant,
          taskTitle: task.description,
        }),
      )

      if (completeTask.fulfilled.match(resultAction)) {
        showToast("Task marked as completed", "success")
      } else if (completeTask.rejected.match(resultAction)) {
        const error = resultAction.payload as string
        showToast(`Failed to complete task: ${error}`, "error")
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error")
      console.error("Error completing task:", error)
    }
  }

  // Group tasks by meeting
  const groupTasksByMeeting = (tasks: Task[]) => {
    const groupedTasks: { [key: string]: { meeting: Meeting; tasks: Task[] } } = {}

    tasks.forEach((task) => {
      if (task.meeting && task.meeting.meetingUniqueId) {
        const meetingId = task.meeting.meetingUniqueId

        if (!groupedTasks[meetingId]) {
          groupedTasks[meetingId] = {
            meeting: task.meeting,
            tasks: [],
          }
        }

        groupedTasks[meetingId].tasks.push(task)
      }
    })

    return Object.values(groupedTasks)
  }

  const groupedTasks = groupTasksByMeeting(tasks)

  // Sort grouped tasks by meeting start time (newest first)
  const sortedGroupedTasks = [...groupedTasks].sort((a, b) => {
    const dateA = a.meeting.startTime ? new Date(a.meeting.startTime).getTime() : 0
    const dateB = b.meeting.startTime ? new Date(b.meeting.startTime).getTime() : 0
    return dateB - dateA // Descending order (newest first)
  })

  console.log("Sorted grouped tasks:", sortedGroupedTasks.length, "meetings")

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get UTC date components
    const day = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
  
    // Format time in 12-hour format with AM/PM
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12; // Convert 0 to 12 for 12-hour format
  
    return `${day} ${month} ${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {sortedGroupedTasks.map((group, groupIndex) => (
        <div key={group.meeting.meetingUniqueId} className="bg-card text-card-foreground">
          <div className=" bg-muted/30 px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">{group.meeting.meetingTitle}</h3>
              <div className="mt-1 flex flex-col text-sm text-muted-foreground sm:mt-0 sm:text-right">
                {group.meeting.startTime && 
                <span style={{ fontSize: "12px" }}>{formatDate(group.meeting.startTime)}</span>}
                <span className="text-xs">Organizer: {group.meeting.organizer}</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2">
            <div className="space-y-2">
              {group.tasks.map((task) => (
                <div key={task.id} className="py-1.5">
                  <div className="flex items-start">
                    {/* Checkbox UI with loading state */}
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="mr-3 mt-0.5 flex-shrink-0 text-gray-400 hover:text-primary transition-colors"
                      disabled={!!completingTasks[task.id]}
                    >
                      {completingTasks[task.id] ? (
                        <Loader className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.meetingParticipant && (
                          <span className="text-xs text-gray-500 mt-0.5 sm:mt-0">{task.meetingParticipant}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add reference for the last group's last task */}
          {groupIndex === sortedGroupedTasks.length - 1 && <div ref={lastTaskElementRef} className="h-4" />}
        </div>
      ))}

      {/* If there are no grouped tasks, still need a reference element */}
      {sortedGroupedTasks.length === 0 && <div ref={lastTaskElementRef} className="h-4" />}
    </div>
  )
}
