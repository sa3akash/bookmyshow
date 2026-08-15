"use client";

import React, { useState } from "react";
import { Copy } from "lucide-react";

interface JsonTabProps {
  jsonPayload: string;
}

export function JsonTab({ jsonPayload }: JsonTabProps) {
  const [copied, setCopied] = useState(false);

  const copyJson = async () => {
    await navigator.clipboard.writeText(jsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold text-white">
          Database Sync JSON Payload
        </div>
        <button
          type="button"
          onClick={copyJson}
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-500"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copied" : "Copy Payload"}
        </button>
      </div>

      <pre className="max-h-[650px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-[11px] text-emerald-400 font-mono">
        {jsonPayload}
      </pre>
    </div>
  );
}
