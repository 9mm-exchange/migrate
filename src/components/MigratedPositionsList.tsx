"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMigratedPositions, type MigratedPosition } from "@/hooks/useMigratedPositions";
import { EXPLORER } from "@/constants/addresses";
import { shortenAddress } from "@/lib/utils";

const FEE_TIER_LABELS: Record<number, string> = {
  100: "0.01%",
  500: "0.05%",
  2500: "0.25%",
  3000: "0.3%",
  10000: "1%",
};

function MigratedPositionCard({
  position,
  onRemove,
}: {
  position: MigratedPosition;
  onRemove: () => void;
}) {
  const migratedDate = new Date(position.migratedAt).toLocaleDateString();

  return (
    <div className="p-4 rounded-xl bg-[#0a100a] border border-[#2a3820] space-y-3 group hover:border-[#cfff04]/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#cfff04] to-[#8aa860] border-2 border-[#0a100a] flex items-center justify-center text-xs font-bold text-[#050807]">
              {position.pairName?.split("/")[0]?.slice(0, 2) || "T0"}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d9ff36] to-[#e2ff68] border-2 border-[#0a100a] flex items-center justify-center text-xs font-bold text-[#050807]">
              {position.pairName?.split("/")[1]?.slice(0, 2) || "T1"}
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              {position.pairName || `Position #${position.tokenId}`}
            </span>
            <p className="text-xs text-[#8aa860] font-mono">ID: {position.tokenId}</p>
          </div>
        </div>
        <Badge className="bg-[#cfff04]/10 text-[#cfff04] border-[#cfff04]/30">
          {FEE_TIER_LABELS[position.fee] || `${position.fee / 10000}%`}
        </Badge>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-[#2a3820]">
        <div className="text-xs text-[#8aa860] flex items-center gap-3">
          <span>{migratedDate}</span>
          {position.txHash && (
            <a href={EXPLORER.tx(position.txHash)} target="_blank" rel="noopener noreferrer"
              className="text-[#cfff04] hover:underline">
              View tx →
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a href={`https://dex.9mm.pro/liquidity/${position.tokenId}?chain=pulsechain`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#cfff04] hover:underline font-medium">
            9mm →
          </a>
          <Button variant="ghost" size="sm"
            className="h-6 w-6 p-0 text-[#8aa860] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove} title="Remove from list">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MigratedPositionsList() {
  const { positions, isLoading, removePosition, clearAllPositions, refetch } = useMigratedPositions();

  return (
    <Card className="bg-[#0a100a]/80 backdrop-blur-sm border-[#2a3820] rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#2a3820] bg-[#0a100a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d9ff36]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#d9ff36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <CardTitle className="text-lg text-white">Migrated Positions</CardTitle>
            <p className="text-xs text-[#8aa860]">Your V3 positions from this app</p>
          </div>
          {positions.length > 0 && (
            <Badge className="bg-[#d9ff36] text-[#050807] font-bold ml-2">
              {positions.length}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {positions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllPositions}
              className="text-xs text-[#8aa860] hover:text-red-400">
              Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}
            className="border-[#2a3820] bg-[#1a2310] hover:bg-[#2a3820] text-[#8aa860]">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-[#cfff04] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#8aa860]">Loading...</p>
          </div>
        ) : positions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1a2310] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#8aa860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">No Migrated Positions Yet</p>
            <p className="text-xs text-[#8aa860]">
              Positions you migrate will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {positions.map((position) => (
              <MigratedPositionCard
                key={position.tokenId}
                position={position}
                onRemove={() => removePosition(position.tokenId)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
