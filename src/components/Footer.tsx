"use client";

import { useRpcStatus } from "@/hooks/useRpcStatus";

export function Footer() {
  const { rpcStatus, blockNumber, latency } = useRpcStatus();

  return (
    <footer className="border-t border-[#2a3820] bg-[#0a100a]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* RPC */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" title={latency ? `${latency}ms` : ""}>
              <span className={`w-2 h-2 rounded-full ${
                rpcStatus === "ok" ? "bg-[#cfff04]" :
                rpcStatus === "lag" ? "bg-[#e2ff68]" :
                rpcStatus === "error" ? "bg-red-400" : "bg-[#8aa860]"
              }`} />
              <span className="text-[#8aa860]">RPC</span>
              <span className={
                rpcStatus === "ok" ? "text-[#cfff04]" :
                rpcStatus === "lag" ? "text-[#e2ff68]" :
                rpcStatus === "error" ? "text-red-400" : "text-[#8aa860]"
              }>
                {rpcStatus === "ok" ? "Live" : rpcStatus === "lag" ? "Slow" : rpcStatus === "error" ? "Down" : "..."}
              </span>
            </div>
            {blockNumber && (
              <span className="text-[#5a7040]">Block {blockNumber.toString()}</span>
            )}
          </div>

          <span className="text-[#5a7040]">v1.0.0</span>

          <div className="flex items-center gap-4">
            <a href="https://scan.pulsechain.com" target="_blank" rel="noopener noreferrer" className="text-[#8aa860] hover:text-[#cfff04]">
              PulseScan
            </a>
            <a href="https://dex.9mm.pro" target="_blank" rel="noopener noreferrer" className="text-[#8aa860] hover:text-[#d9ff36]">
              9mm
            </a>
            <a href="https://pulsex.com" target="_blank" rel="noopener noreferrer" className="text-[#8aa860] hover:text-[#cfff04]">
              PulseX
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
