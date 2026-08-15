import { FunnelStage } from "../../analytics.types";
import { analyticsRepository } from "../../infrastructure/repositories/analytics.repository";

export interface BookingFunnelResponse {
  stages: FunnelStage[];
  summary: {
    showToSeatConversion: number;
    seatToHoldConversion: number;
    holdToPaymentConversion: number;
    paymentToBookingConversion: number;
    overallBookingConversion: number;
  };
}

export class FunnelService {
  private static FUNNEL_STAGES = [
    "movie_view",
    "show_view",
    "seat_view",
    "seat_selected",
    "seat_held",
    "checkout_started",
    "payment_started",
    "payment_success",
    "booking_confirmed",
    "ticket_issued",
  ];

  public async getBookingFunnel(startDate?: Date, endDate?: Date): Promise<FunnelStage[] & BookingFunnelResponse> {
    // 1. Single efficient database query for all 10 stage counts
    const stageCounts = await analyticsRepository.getFunnelCounts(
      FunnelService.FUNNEL_STAGES,
      startDate,
      endDate
    );

    const firstStageCount = stageCounts[FunnelService.FUNNEL_STAGES[0] ?? "movie_view"] ?? 0;
    const funnelStages: FunnelStage[] = [];

    // 2. Pure data-driven conversion calculations
    for (let i = 0; i < FunnelService.FUNNEL_STAGES.length; i++) {
      const stageName = FunnelService.FUNNEL_STAGES[i];
      if (!stageName) continue;

      const actualCount = stageCounts[stageName] ?? 0;
      const prevStage = i > 0 ? funnelStages[i - 1] : undefined;
      const prevCount = prevStage ? prevStage.count : actualCount;

      let conversionFromPrevious = 0;
      if (prevCount > 0) {
        conversionFromPrevious = Number(((actualCount / prevCount) * 100).toFixed(2));
      } else if (actualCount > 0) {
        conversionFromPrevious = 100;
      }

      let overallConversion = 0;
      if (firstStageCount > 0) {
        overallConversion = Number(((actualCount / firstStageCount) * 100).toFixed(2));
      } else if (actualCount > 0) {
        overallConversion = 100;
      }

      funnelStages.push({
        stage: stageName,
        count: actualCount,
        conversionFromPrevious,
        overallConversion,
      });
    }

    const showCount = stageCounts["show_view"] ?? 0;
    const seatViewCount = stageCounts["seat_view"] ?? 0;
    const seatHeldCount = stageCounts["seat_held"] ?? 0;
    const paymentStartCount = stageCounts["payment_started"] ?? 0;
    const bookingConfirmedCount = stageCounts["booking_confirmed"] ?? 0;
    const ticketIssuedCount = stageCounts["ticket_issued"] ?? 0;

    const summary = {
      showToSeatConversion: showCount > 0 ? Number(((seatViewCount / showCount) * 100).toFixed(2)) : 0,
      seatToHoldConversion: seatViewCount > 0 ? Number(((seatHeldCount / seatViewCount) * 100).toFixed(2)) : 0,
      holdToPaymentConversion: seatHeldCount > 0 ? Number(((paymentStartCount / seatHeldCount) * 100).toFixed(2)) : 0,
      paymentToBookingConversion: paymentStartCount > 0 ? Number(((bookingConfirmedCount / paymentStartCount) * 100).toFixed(2)) : 0,
      overallBookingConversion: firstStageCount > 0 ? Number(((ticketIssuedCount / firstStageCount) * 100).toFixed(2)) : 0,
    };

    // Attach summary and stages compatibility
    const response = funnelStages as any;
    response.stages = funnelStages;
    response.summary = summary;

    return response;
  }
}

export const funnelService = new FunnelService();
