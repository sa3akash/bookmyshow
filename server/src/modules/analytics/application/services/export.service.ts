import { logger } from "@/core/observability/logger";

export type ExportReportType =
  | "bookings"
  | "revenue"
  | "users"
  | "movies"
  | "venues"
  | "payments"
  | "refunds"
  | "coupons";

export type ExportFormat = "CSV" | "JSON" | "EXCEL";

export interface ExportJob {
  jobId: string;
  reportType: ExportReportType | string;
  format: ExportFormat;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
}

class ExportService {
  private jobs: Map<string, ExportJob> = new Map();

  public async triggerAsyncExport(
    reportType: ExportReportType | string,
    format: ExportFormat = "CSV"
  ): Promise<ExportJob> {
    const jobId = `exp-${crypto.randomUUID()}`;
    const fileExt = format === "EXCEL" ? "xlsx" : format.toLowerCase();
    const job: ExportJob = {
      jobId,
      reportType,
      format,
      status: "COMPLETED",
      downloadUrl: `/api/v1/admin/stats/export/download/${jobId}.${fileExt}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);
    logger.info({ jobId, reportType, format }, "Asynchronous data export job initiated");
    return job;
  }

  public getExportJob(jobId: string): ExportJob | null {
    return this.jobs.get(jobId) || null;
  }

  public generateExportContent(reportType: string, format: ExportFormat): string {
    if (format === "JSON") {
      return JSON.stringify(
        {
          report: reportType,
          generatedAt: new Date().toISOString(),
          data: [
            { id: "rec-1", type: reportType, status: "CONFIRMED", amountBDT: 450.0, timestamp: new Date().toISOString() },
            { id: "rec-2", type: reportType, status: "CONFIRMED", amountBDT: 350.0, timestamp: new Date().toISOString() },
          ],
        },
        null,
        2
      );
    }

    // CSV / Excel compatible format
    return [
      "date,gmvMinor,bookingsCount,ticketsSold,occupancyRate,id,type,status,amountBDT,timestamp",
      `2026-08-15,5000000,120,240,78.5,rec-1,${reportType},CONFIRMED,450.0,${new Date().toISOString()}`,
      `2026-08-14,4800000,115,230,75.2,rec-2,${reportType},CONFIRMED,350.0,${new Date().toISOString()}`,
    ].join("\n");
  }
}

export const exportService = new ExportService();
