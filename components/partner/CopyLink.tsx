"use client";
import { useState } from "react";

export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input readOnly value={link} className="input !w-auto min-w-64 flex-1 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <button className="btn" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
        {copied ? "Copied" : "Copy link"}
      </button>
      <a className="btn-outline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Looking for property in Nigeria? Check out Celestia Estates: ${link}`)}`}>Share on WhatsApp</a>
    </div>
  );
}
