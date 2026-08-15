import { Metadata } from "next";
import { DashboardClientView } from "@/components/views/DashboardClientView";

export const metadata: Metadata = {
  title: "Executive Dashboard & Operations | BookMyShow Admin Console",
  description: "Real-time revenue metrics, ticket bookings, venue occupancy, top grossing movies, and analytics.",
};

export default function DashboardOverviewPage() {
  return <DashboardClientView />;
}
