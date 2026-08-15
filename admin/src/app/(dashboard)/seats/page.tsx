import { Metadata } from "next";
import { SeatLayoutEditor } from "@/components/seat-editor/SeatLayoutEditor";
import { Armchair, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Visual Seat Layout & Tier Matrix Designer | BookMyShow Admin Console",
  description: "Interactive cinema auditorium seat map editor, tier categorizations, dynamic pricing, and physical lock controls.",
};

export default function SeatsPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/90 p-6 rounded-2xl border border-border/80 shadow-md backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Armchair className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black tracking-tight text-foreground">Visual Seat Layout & Tier Matrix Designer</h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              Studio Tier Engine
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Design multiplex screen seat grids, row lettering, tier pricing matrices (Recliner, VIP, 4DX, Couple, Accessible), and surge multipliers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl border border-border/60">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Automatic Pricing Rule Synchronization</span>
        </div>
      </div>

      {/* Main Studio Editor Component */}
      <SeatLayoutEditor />
    </div>
  );
}
