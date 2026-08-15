"use client";

import * as React from "react";
import { Settings, Sliders, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [flags, setFlags] = React.useState([
    { key: "ENABLE_DYNAMIC_PRICING", name: "Dynamic Seat Pricing Engine", enabled: true, rollout: "100%" },
    { key: "ENABLE_INSTANT_REFUNDS", name: "Instant Digital Wallet Refunds", enabled: true, rollout: "100%" },
    { key: "ENABLE_BOT_SHIELD", name: "Bot & Abuse Prevention Shield", enabled: true, rollout: "100%" },
    { key: "ENABLE_AI_RECOMMENDATIONS", name: "ML Movie Recommendations", enabled: false, rollout: "0%" },
  ]);

  const toggleFlag = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">Application Settings & Feature Flags</h1>
        <p className="text-xs text-muted-foreground">Manage global application runtime toggles, seat lock durations, and rate limits.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Feature Flags & Toggles</CardTitle>
          <CardDescription className="text-xs">Safely control platform feature rollouts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {flags.map((f) => (
            <div key={f.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
              <div>
                <span className="font-bold text-foreground text-xs block">{f.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{f.key} • Rollout: {f.rollout}</span>
              </div>
              <Button
                variant={f.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFlag(f.key)}
                className="h-8 text-xs font-bold"
              >
                {f.enabled ? "ENABLED" : "DISABLED"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
