"use client";

import * as React from "react";
import { Activity, CheckCircle2, AlertTriangle, Layers, Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SystemHealthPage() {
  const services = [
    { name: "Backend API (Elysia Node/Bun)", status: "HEALTHY", latency: "14ms" },
    { name: "PostgreSQL Primary DB", status: "HEALTHY", latency: "2ms" },
    { name: "Redis Cache Cluster", status: "HEALTHY", latency: "1ms" },
    { name: "Kafka Message Broker", status: "HEALTHY", lag: "0 msgs" },
    { name: "OpenSearch Search Engine", status: "HEALTHY", latency: "8ms" },
    { name: "bKash Payment Gateway", status: "HEALTHY", successRate: "99.1%" },
    { name: "Nagad Payment Gateway", status: "HEALTHY", successRate: "97.8%" },
  ];

  const queues = [
    { name: "booking-seat-release", waiting: 0, active: 2, completed: 18450, failed: 0, dlq: 0 },
    { name: "pdf-ticket-generation", waiting: 1, active: 1, completed: 12400, failed: 2, dlq: 0 },
    { name: "notification-email-sms", waiting: 0, active: 4, completed: 25800, failed: 5, dlq: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">System Infrastructure Health</h1>
          <p className="text-xs text-muted-foreground">Monitor microservices, database latencies, background worker queues, and dead-letter queues.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 font-bold">
          <RefreshCw className="h-3.5 w-3.5" /> Ping Services
        </Button>
      </div>

      {/* Services Health Grid (Rule 46) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((s, idx) => (
          <Card key={idx}>
            <CardHeader className="py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold">{s.name}</CardTitle>
              <Badge variant="success" className="text-[9px]">
                {s.status}
              </Badge>
            </CardHeader>
            <CardContent className="py-0 pb-3">
              <span className="text-[11px] text-muted-foreground">
                {s.latency ? `Latency: ${s.latency}` : s.lag ? `Lag: ${s.lag}` : `Success: ${s.successRate}`}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Background Queues Monitoring (Rule 47) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> BullMQ Background Queues
          </CardTitle>
          <CardDescription className="text-xs">Job processing latency, worker throughput, and Dead-Letter Queue (DLQ) state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground border-b border-border/80 uppercase font-semibold">
                <tr>
                  <th className="pb-3">Queue Name</th>
                  <th className="pb-3">Waiting</th>
                  <th className="pb-3">Active</th>
                  <th className="pb-3">Completed</th>
                  <th className="pb-3">Failed</th>
                  <th className="pb-3">DLQ</th>
                  <th className="pb-3 text-right">Queue Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {queues.map((q) => (
                  <tr key={q.name} className="hover:bg-muted/30">
                    <td className="py-3 font-bold text-foreground">{q.name}</td>
                    <td className="py-3 text-muted-foreground">{q.waiting}</td>
                    <td className="py-3 font-semibold text-primary">{q.active}</td>
                    <td className="py-3 font-semibold text-emerald-400">{q.completed}</td>
                    <td className="py-3 font-semibold text-amber-400">{q.failed}</td>
                    <td className="py-3 font-bold text-rose-400">{q.dlq}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                          <Pause className="h-3 w-3" /> Pause
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1">
                          <RefreshCw className="h-3 w-3" /> Retry Failed
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
