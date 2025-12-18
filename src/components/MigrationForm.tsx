"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getFullRangeTicks, EXPLORER } from "@/constants/addresses";
import { useMigrate, type MigrationStep, type MigrationResult } from "@/hooks/useMigrate";
import type { LPPosition } from "@/hooks/useLPPositions";
import { cn } from "@/lib/utils";

interface MigrationFormProps {
  position: LPPosition | null;
  onSuccess?: (result: MigrationResult) => void;
}

const SLIPPAGE_OPTIONS = [0.5, 1, 2, 5];

const FEE_LABELS: Record<number, string> = {
  100: "0.01%", 500: "0.05%", 2500: "0.25%", 3000: "0.3%", 10000: "1%",
};

export function MigrationForm({ position, onSuccess }: MigrationFormProps) {
  const [slippage, setSlippage] = useState(1);
  const [customSlippage, setCustomSlippage] = useState("");

  const {
    step, error, approveHash, migrateHash, migrationResult,
    isApprovePending, isMigratePending, isApproveConfirming, isMigrateConfirming,
    approveAndMigrate, reset,
  } = useMigrate();

  const effectiveSlippage = customSlippage ? parseFloat(customSlippage) : slippage;
  const isProcessing = isApprovePending || isMigratePending || isApproveConfirming || isMigrateConfirming;
  const feeTier = position?.v3FeeTier || 3000;
  const { minTick, maxTick } = getFullRangeTicks(feeTier);

  const handleMigrate = async () => {
    if (!position) return;
    const result = await approveAndMigrate(position, { feeTier, slippagePercent: effectiveSlippage });
    if (result && onSuccess) onSuccess(result);
  };

  const getStatusText = (s: MigrationStep) => {
    const map: Record<MigrationStep, { label: string; hint: string; color: string }> = {
      idle: { label: "Ready", hint: "", color: "text-[#8aa860]" },
      approving: { label: "Approving", hint: "Confirm in wallet", color: "text-[#e2ff68]" },
      approved: { label: "Approved", hint: "Preparing migration...", color: "text-[#cfff04]" },
      migrating: { label: "Migrating", hint: "Confirm in wallet", color: "text-[#e2ff68]" },
      success: { label: "Complete", hint: "Migration successful", color: "text-[#cfff04]" },
      error: { label: "Failed", hint: "See error below", color: "text-red-400" },
    };
    return map[s];
  };

  const status = getStatusText(step);

  return (
    <Card className="bg-black border-[#2a3820]">
      <div className="p-4 border-b border-[#2a3820]">
        <h3 className="font-semibold text-white">Migration</h3>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {/* Selected Position */}
        {position ? (
          <div className="p-3 rounded-lg bg-[#1a2310] border border-[#2a3820]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[#8aa860]">Selected</span>
              <Badge className="bg-[#cfff04]/10 text-[#cfff04] border-0">{position.name}</Badge>
            </div>
            <p className="text-2xl font-bold text-white font-mono">{position.formattedBalance} <span className="text-sm font-normal text-[#8aa860]">LP</span></p>
            <p className="text-xs text-[#8aa860] mt-1">
              ≈ {position.formattedShare0} {position.token0Symbol} + {position.formattedShare1} {position.token1Symbol}
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border-2 border-dashed border-[#2a3820] text-center">
            <p className="text-[#8aa860] text-sm">Select a position to migrate</p>
          </div>
        )}

        {/* Target Pool */}
        {position?.v3Pool && (
          <div className="p-3 rounded-lg bg-[#1a2310] border border-[#cfff04]/20">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#cfff04]">Target V3 Pool</span>
              <Badge className="bg-[#d9ff36] text-[#050807] border-0 text-xs">{FEE_LABELS[feeTier]}</Badge>
            </div>
            <p className="text-[10px] text-[#8aa860] mt-1">Full range: {minTick.toLocaleString()} → {maxTick.toLocaleString()}</p>
          </div>
        )}

        {/* Slippage */}
        <div>
          <label className="text-xs text-[#8aa860] block mb-2">Slippage Tolerance</label>
          <div className="flex gap-1.5">
            {SLIPPAGE_OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                size="sm"
                onClick={() => { setSlippage(opt); setCustomSlippage(""); }}
                className={cn(
                  "flex-1 text-xs border-[#2a3820] bg-[#1a2310] hover:bg-[#2a3820] text-[#8aa860]",
                  slippage === opt && !customSlippage && "border-[#cfff04] text-[#cfff04] bg-[#cfff04]/10"
                )}
              >
                {opt}%
              </Button>
            ))}
            <Input
              type="number"
              placeholder="..."
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              className="w-16 text-xs bg-[#1a2310] border-[#2a3820] text-white"
            />
          </div>
        </div>

        {/* Status */}
        {step !== "idle" && (
          <div className={cn(
            "p-3 rounded-lg border",
            step === "success" ? "bg-[#cfff04]/10 border-[#cfff04]/20" :
            step === "error" ? "bg-red-500/10 border-red-500/20" :
            "bg-[#1a2310] border-[#2a3820]"
          )}>
            <div className="flex items-center gap-2">
              {step !== "success" && step !== "error" && (
                <div className="w-4 h-4 border-2 border-[#cfff04] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
              )}
              {step === "success" && <span className="text-[#cfff04]">✓</span>}
              {step === "error" && <span className="text-red-400">✕</span>}
              <div>
                <p className={cn("text-sm font-medium", status.color)}>{status.label}</p>
                {status.hint && <p className="text-xs text-[#8aa860]">{status.hint}</p>}
              </div>
            </div>
            
            {(approveHash || migrateHash) && (
              <div className="mt-2 flex gap-3 text-xs">
                {approveHash && (
                  <a href={EXPLORER.tx(approveHash)} target="_blank" rel="noopener noreferrer" className="text-[#cfff04] hover:underline">
                    Approval tx ↗
                  </a>
                )}
                {migrateHash && (
                  <a href={EXPLORER.tx(migrateHash)} target="_blank" rel="noopener noreferrer" className="text-[#cfff04] hover:underline">
                    Migration tx ↗
                  </a>
                )}
              </div>
            )}
            
            {step === "success" && migrationResult && migrationResult.tokenId !== "unknown" && (
              <a href={`https://dex.9mm.pro/liquidity/${migrationResult.tokenId}?chain=pulsechain`}
                target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-[#d9ff36] hover:underline">
                View on 9mm ↗
              </a>
            )}
          </div>
        )}

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400 text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Button */}
        {step === "success" || step === "error" ? (
          <Button onClick={reset} variant="outline" className="w-full border-[#2a3820] bg-[#1a2310] text-white hover:bg-[#2a3820]">
            {step === "success" ? "Migrate Another" : "Try Again"}
          </Button>
        ) : (
          <Button
            onClick={handleMigrate}
            disabled={!position || !position.v3Pool || isProcessing}
            className="w-full bg-[#cfff04] text-[#050807] hover:bg-[#d9ff36] font-semibold disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : !position?.v3Pool ? "No V3 Pool" : "Migrate to V3"}
          </Button>
        )}
      </CardContent>
      
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
}
