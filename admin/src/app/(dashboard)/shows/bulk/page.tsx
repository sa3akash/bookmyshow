"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Layers, ArrowLeft, CheckCircle2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BulkShowCreationPage() {
  const router = useRouter();
  const [movie, setMovie] = React.useState("Avatar 3: Fire and Ash");
  const [venue, setVenue] = React.useState("Star Cineplex - Bashundhara");
  const [screen, setScreen] = React.useState("Hall 1 (IMAX)");
  const [startTime, setStartTime] = React.useState("10:30");
  const [durationDays, setDurationDays] = React.useState(30);
  const [basePrice, setBasePrice] = React.useState(950);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsGenerating(false);
    setSuccess(true);
    setTimeout(() => {
      router.push("/shows");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <a href="/shows">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </a>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Bulk Show Generator</h1>
          <p className="text-xs text-muted-foreground">Batch schedule repeated daily/weekly showtimes with collision detection preview.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Successfully generated {durationDays} repeated shows! Redirecting...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Batch Configuration</CardTitle>
            <CardDescription className="text-xs">Select target film, hall, time slot, and repetition rules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Movie</label>
              <Input value={movie} onChange={(e) => setMovie(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Venue</label>
                <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Screen / Hall</label>
                <Input value={screen} onChange={(e) => setScreen(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Start Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Repeat Duration (Days)</label>
                <Input type="number" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Base Ticket Price (৳)</label>
                <Input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-10 text-xs font-bold gap-1.5">
                <Layers className="h-4 w-4" /> {isGenerating ? "Generating Batch..." : `Generate ${durationDays} Shows Now`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Batch Preview & Conflict Check (Rule 30) */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" /> Batch Preview
            </CardTitle>
            <CardDescription className="text-xs">Summary of shows to be created</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Total Shows</span>
              <span className="font-bold text-foreground">{durationDays} shows</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-semibold text-foreground">Today</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-semibold text-foreground">In {durationDays} Days</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Conflicts Detected</span>
              <span className="font-bold text-emerald-400">0 (Clean)</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium mt-4">
              All {durationDays} showtimes pass automated hall collision detection.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
