import { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { NotificationPoller } from "@/components/notification-poller"

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell>
      <NotificationPoller />
      {children}
    </DashboardShell>
  )
}
