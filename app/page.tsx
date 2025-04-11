import Sidebar from "@/components/layout/sidebar"
import MeetingsList from "@/components/dashboard/MeetingsList"
import MeetingDetails from "@/components/dashboard/MeetingDetails"

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <MeetingsList />
      <main className="flex-1 overflow-hidden">
        <MeetingDetails />
      </main>
    </div>
  )
}
