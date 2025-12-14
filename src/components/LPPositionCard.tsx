"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LPPosition } from "@/hooks/useLPPositions";
import { cn } from "@/lib/utils";

interface LPPositionCardProps {
  position: LPPosition;
  isSelected: boolean;
  onSelect: () => void;
}

export function LPPositionCard({ position, isSelected, onSelect }: LPPositionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors bg-[#1a2310] border-[#2a3820] hover:border-[#8aa860]",
        isSelected && "border-[#cfff04] bg-[#cfff04]/5"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <div className="w-7 h-7 rounded-full bg-[#cfff04] flex items-center justify-center text-[10px] font-bold text-[#050807]">
                {position.token0Symbol.slice(0, 2)}
              </div>
              <div className="w-7 h-7 rounded-full bg-[#d9ff36] flex items-center justify-center text-[10px] font-bold text-[#050807]">
                {position.token1Symbol.slice(0, 2)}
              </div>
            </div>
            <div>
              <p className="font-medium text-white text-sm">{position.name}</p>
              <p className="text-[10px] text-[#8aa860]">PulseX V2</p>
            </div>
          </div>
          {position.v3FeeTier && (
            <Badge variant="outline" className="border-[#2a3820] text-[#8aa860] text-[10px]">
              {position.v3FeeTier / 10000}%
            </Badge>
          )}
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8aa860]">Balance</span>
            <span className="font-mono text-white">{position.formattedBalance}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#5a7040]">{position.token0Symbol}</span>
            <span className="font-mono text-[#d9ff36]">≈ {position.formattedShare0}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#5a7040]">{position.token1Symbol}</span>
            <span className="font-mono text-[#e2ff68]">≈ {position.formattedShare1}</span>
          </div>
        </div>

        {isSelected && (
          <div className="mt-3 pt-3 border-t border-[#2a3820] flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#cfff04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs text-[#cfff04]">Selected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
