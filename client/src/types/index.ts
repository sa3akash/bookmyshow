export interface City {
  id: string;
  name: string;
  state?: string;
  country: string;
  isPopular?: boolean;
}

export interface CastMember {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface CrewMember {
  name: string;
  role: string;
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl?: string;
  description: string;
  durationMinutes: number;
  languages: string[];
  genres: string[];
  releaseDate: string;
  rating: number;
  votesCount?: number;
  certificate?: string; // e.g. "U/A 16+", "PG-13", "R"
  formats: string[]; // e.g. ["2D", "3D", "IMAX 3D", "4DX"]
  status: "NOW_SHOWING" | "COMING_SOON" | "TRENDING";
  cast?: CastMember[];
  crew?: CrewMember[];
  trailerUrl?: string;
  isFavorite?: boolean;
}

export interface Venue {
  id: string;
  cityId: string;
  name: string;
  area: string;
  address: string;
  totalScreens: number;
  amenities: string[];
  distanceKm?: number;
}

export interface Screen {
  id: string;
  venueId: string;
  name: string;
  supportedFormats: string[];
  totalSeats: number;
}

export type ShowAvailability =
  | "AVAILABLE"
  | "FAST_FILLING"
  | "ALMOST_FULL"
  | "SOLD_OUT"
  | "CANCELLED";

export interface Show {
  id: string;
  movieId: string;
  movieTitle?: string;
  moviePoster?: string;
  venueId: string;
  venueName?: string;
  screenId: string;
  screenName?: string;
  showDate: string; // ISO Date YYYY-MM-DD
  startTime: string; // e.g. "10:30 AM" or "10:30"
  endTime: string;
  language: string;
  format: string; // e.g. "IMAX 3D"
  basePrice: number;
  availability: ShowAvailability;
  availableSeatsCount?: number;
  totalSeatsCount?: number;
}

export type SeatType =
  | "REGULAR"
  | "PREMIUM"
  | "VIP"
  | "RECLINER"
  | "COUPLE"
  | "ACCESSIBLE"
  | "WALKWAY";

export type SeatCategory =
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "VIP"
  | "RECLINER"
  | "COUPLE"
  | "ACCESSIBLE";

export type SeatPhysicalStatus =
  | "AVAILABLE"
  | "SELECTED"
  | "HELD"
  | "BOOKED"
  | "BLOCKED"
  | "UNAVAILABLE";

export interface SeatItem {
  id: string;
  rowId: string;
  rowLabel: string;
  col: number;
  number: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  type: SeatType;
  category: SeatCategory;
  price: number;
  status: SeatPhysicalStatus;
}

export interface SeatHold {
  holdId: string;
  showId: string;
  seatIds: string[];
  expiresAt: string; // ISO string
  secondsRemaining?: number;
}

export interface Booking {
  bookingId: string;
  showId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  venueId: string;
  venueName: string;
  screenName: string;
  showDate: string;
  startTime: string;
  format: string;
  language: string;
  seatLabels: string[];
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  convenienceFee: number;
  taxAmount: number;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  qrCodeToken: string;
  createdAt: string;
  paymentMethod?: string;
}

export interface Coupon {
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  description: string;
  minBookingAmount?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: "MOBILE_BANKING" | "CARD" | "NET_BANKING" | "WALLET";
  description?: string;
}
