export interface DashboardOverviewDTO {
  users: {
    total: number;
    new: number;
    active: number;
  };
  bookings: {
    total: number;
    successful: number;
    failed: number;
    cancelled: number;
  };
  tickets: {
    sold: number;
  };
  revenue: {
    gross: number;
    discount: number;
    refund: number;
    net: number;
  };
  occupancy: {
    rate: number;
  };
  payments: {
    successRate: number;
    failureRate: number;
  };
}

export interface ChartDataPointDTO {
  date: string;
  bookings: number;
  revenue: number;
  occupancy: number;
}

export interface ChartDataResponseDTO {
  period: "daily" | "hourly" | "weekly" | "monthly";
  data: ChartDataPointDTO[];
}

export interface ComparisonMetricDTO {
  current: number;
  previous: number;
  change: number;
  percentage: number;
  trend: "UP" | "DOWN" | "FLAT";
}

export interface ComparisonResponseDTO {
  revenue: ComparisonMetricDTO;
  bookings: ComparisonMetricDTO;
  users: ComparisonMetricDTO;
  occupancy: ComparisonMetricDTO;
}
