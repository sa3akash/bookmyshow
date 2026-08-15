export type StatisticConsistencyLevel = "REAL_TIME" | "NEAR_REAL_TIME" | "EVENTUAL" | "FINALIZED";

export class ConsistencyClassifier {
  public static classify(metricKey: string): StatisticConsistencyLevel {
    const key = metricKey.toLowerCase();
    if (key.includes("seat") || key.includes("realtime") || key.includes("live") || key.includes("occupancy")) {
      return "REAL_TIME";
    }
    if (key.includes("today") || key.includes("hourly") || key.includes("current") || key.includes("active")) {
      return "NEAR_REAL_TIME";
    }
    if (key.includes("settlement") || key.includes("ledger") || key.includes("reconcil") || key.includes("payout")) {
      return "FINALIZED";
    }
    return "EVENTUAL";
  }
}
