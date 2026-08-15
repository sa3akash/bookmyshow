"use client";

import * as React from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ShowCalendarPage() {
  const [view, setView] = React.useState<"day" | "week" | "month">("week");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/shows">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </a>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Show Calendar Grid</h1>
            <p className="text-xs text-muted-foreground">Visual calendar view of scheduled showtimes across cinema halls.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-bold text-foreground">August 15 - August 21, 2026</span>
            <Button variant="outline" size="icon" className="h-7 w-7">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Badge variant="outline" className="text-[10px]">
            Showing 4 Halls
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-8 border-b border-border/80 text-xs font-semibold text-muted-foreground bg-muted/30">
              <div className="p-3 border-r border-border/60">Screen / Hall</div>
              <div className="p-3 text-center border-r border-border/60">Sat 15</div>
              <div className="p-3 text-center border-r border-border/60">Sun 16</div>
              <div className="p-3 text-center border-r border-border/60">Mon 17</div>
              <div className="p-3 text-center border-r border-border/60">Tue 18</div>
              <div className="p-3 text-center border-r border-border/60">Wed 19</div>
              <div className="p-3 text-center border-r border-border/60">Thu 20</div>
              <div className="p-3 text-center">Fri 21</div>
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-8 border-b border-border/40 text-xs min-h-[120px]">
              <div className="p-3 border-r border-border/60 font-bold text-foreground bg-muted/10">
                Hall 1 (IMAX 3D)
                <span className="block text-[10px] font-normal text-muted-foreground">Star Cineplex</span>
              </div>
              <div className="p-2 border-r border-border/60 space-y-2">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-[11px] font-bold">
                  <span>Avatar 3</span>
                  <span className="block text-[9px] font-normal text-muted-foreground">10:30 AM (96% Sold)</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-bold">
                  <span>Avatar 3</span>
                  <span className="block text-[9px] font-normal text-muted-foreground">02:30 PM (100% Sold)</span>
                </div>
              </div>
              <div className="p-2 border-r border-border/60 space-y-2">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-[11px] font-bold">
                  <span>Avatar 3</span>
                  <span className="block text-[9px] font-normal text-muted-foreground">10:30 AM</span>
                </div>
              </div>
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2" />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-8 border-b border-border/40 text-xs min-h-[120px]">
              <div className="p-3 border-r border-border/60 font-bold text-foreground bg-muted/10">
                Cinema 1 (Dolby)
                <span className="block text-[10px] font-normal text-muted-foreground">Blockbuster</span>
              </div>
              <div className="p-2 border-r border-border/60 space-y-2">
                <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-bold">
                  <span>Priyotoma 2</span>
                  <span className="block text-[9px] font-normal text-muted-foreground">06:30 PM (84% Sold)</span>
                </div>
              </div>
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2 border-r border-border/60" />
              <div className="p-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
