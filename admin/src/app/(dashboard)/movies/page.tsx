import { Metadata } from "next";
import { MoviesClientView } from "@/components/views/MoviesClientView";

export const metadata: Metadata = {
  title: "Movie Catalog & Media | BookMyShow Admin Console",
  description: "Manage movie listings, ratings, languages, formats, release dates, and box office earnings.",
};

export default function MoviesManagementPage() {
  return <MoviesClientView />;
}
