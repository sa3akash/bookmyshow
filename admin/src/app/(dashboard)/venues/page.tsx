import { Metadata } from "next";
import { VenuesClientView } from "@/components/views/VenuesClientView";

export const metadata: Metadata = {
  title: "Venues & Cinema Complexes | BookMyShow Admin Console",
  description: "Manage multiplex cinema branches, venue screens, addresses, and seat layout capacity.",
};

export default function VenuesManagementPage() {
  return <VenuesClientView />;
}
