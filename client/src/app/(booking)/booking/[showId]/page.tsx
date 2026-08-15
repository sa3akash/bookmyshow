import { redirect } from "next/navigation";

interface BookingPageProps {
  params: Promise<{ showId: string }>;
}

export default async function BookingShowIdPage({ params }: BookingPageProps) {
  const { showId } = await params;
  redirect(`/booking/${showId}/seats`);
}
