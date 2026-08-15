import { Metadata } from "next";
import { ScreensClientView } from "@/components/views/ScreensClientView";

export const metadata: Metadata = {
  title: "Auditorium Screens & Tech Formats | BookMyShow Admin Console",
  description: "Configure cinema auditorium screens, IMAX 3D, 4DX motion pods, and Dolby Atmos audio systems.",
};

export default function ScreensManagementPage() {
  return <ScreensClientView />;
}
