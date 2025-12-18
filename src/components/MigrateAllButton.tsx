"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PULSEX_PAIR_ABI, V3_MIGRATOR_ABI } from "@/constants/abis";
import { NINEMM_CONTRACTS, getFullRangeTicks, EXPLORER } from "@/constants/addresses";
import { applySlippage, getDeadline } from "@/lib/utils";
import type { LPPosition } from "@/hooks/useLPPositions";

interface MigrateAllButtonProps {
  positions: LPPosition[];
  slippage?: number;
  onStart?: () => void;
  onSuccess?: () => void;
}

type Status = "idle" | "approving" | "waiting_approval" | "migrating" | "waiting_migration" | "success" | "error";

interface Progress {
  position: LPPosition;
  status: Status;
  txHash?: string;
  error?: string;
}

const STATUS_TEXT: Record<Status, string> = {
  idle: "Queued",
  approving: "Sign approval...",
  waiting_approval: "Confirming approval...",
  migrating: "Sign migration...",
  waiting_migration: "Confirming migration...",
  success: "Done",
  error: "Failed",
};

const STATUS_COLOR: Record<Status, string> = {
  idle: "text-[#8aa860]",
  approving: "text-[#e2ff68]",
  waiting_approval: "text-[#e2ff68]",
  migrating: "text-[#e2ff68]",
  waiting_migration: "text-[#e2ff68]",
  success: "text-[#cfff04]",
  error: "text-red-400",
};

export function MigrateAllButton({ positions, slippage = 1, onStart, onSuccess }: MigrateAllButtonProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentAction, setCurrentAction] = useState("");
  const [overallError, setOverallError] = useState<string | null>(null);

  const migrateAll = useCallback(async () => {
    if (!address || !publicClient || positions.length === 0) return;

    // Notify parent that batch migration is starting
    if (onStart) onStart();

    setIsRunning(true);
    setOverallError(null);
    setProgress(positions.map((p) => ({ position: p, status: "idle" })));

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      
      try {
        // Approve
        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "approving" } : p));
        setCurrentAction(`${i + 1}/${positions.length}: Approve ${pos.name} in wallet`);

        const approveHash = await writeContractAsync({
          address: pos.pairAddress,
          abi: PULSEX_PAIR_ABI,
          functionName: "approve",
          args: [NINEMM_CONTRACTS.V3_MIGRATOR, pos.balance],
        });

        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "waiting_approval" } : p));
        setCurrentAction(`${i + 1}/${positions.length}: Waiting for approval...`);
        await publicClient.waitForTransactionReceipt({ 
          hash: approveHash, 
          confirmations: 2,
          timeout: 120_000, // 2 minutes
          pollingInterval: 2_000, // Check every 2 seconds
        });

        // Migrate
        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "migrating" } : p));
        setCurrentAction(`${i + 1}/${positions.length}: Confirm migration for ${pos.name}`);

        if (!pos.v3FeeTier) throw new Error("No V3 fee tier");

        const { minTick, maxTick } = getFullRangeTicks(pos.v3FeeTier);
        const params = {
          pair: pos.pairAddress,
          liquidityToMigrate: pos.balance,
          percentageToMigrate: 100,
          token0: pos.token0,
          token1: pos.token1,
          fee: pos.v3FeeTier,
          tickLower: minTick,
          tickUpper: maxTick,
          amount0Min: applySlippage(pos.userShare0, slippage),
          amount1Min: applySlippage(pos.userShare1, slippage),
          recipient: address,
          deadline: getDeadline(20),
          refundAsETH: false,
        };

        const migrateHash = await writeContractAsync({
          address: NINEMM_CONTRACTS.V3_MIGRATOR,
          abi: V3_MIGRATOR_ABI,
          functionName: "migrate",
          args: [params],
        });

        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "waiting_migration" } : p));
        setCurrentAction(`${i + 1}/${positions.length}: Confirming migration...`);
        await publicClient.waitForTransactionReceipt({ 
          hash: migrateHash, 
          confirmations: 2,
          timeout: 120_000, // 2 minutes
          pollingInterval: 2_000, // Check every 2 seconds
        });

        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "success", txHash: migrateHash } : p));
      } catch (err: any) {
        setProgress((prev) => prev.map((p, idx) => idx === i ? { ...p, status: "error", error: err.shortMessage || err.message } : p));
      }
    }

    setIsRunning(false);
    setCurrentAction("");
  }, [address, publicClient, positions, slippage, writeContractAsync, onStart]);

  const completed = progress.filter((p) => p.status === "success").length;
  const failed = progress.filter((p) => p.status === "error").length;

  if (positions.length < 2) return null;

  return (
    <Card className="bg-black border-[#2a3820]">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3820]">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Batch Migration</h3>
          <Badge className="bg-[#d9ff36] text-[#050807] border-0">{positions.length}</Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        {!isRunning && progress.length === 0 ? (
          <>
            <p className="text-sm text-[#8aa860]">
              Migrate all {positions.length} positions. Each requires 2 wallet confirmations.
            </p>
            <Button onClick={migrateAll} className="w-full bg-[#d9ff36] text-[#050807] hover:bg-[#e2ff68] font-semibold">
              Migrate All Positions
            </Button>
          </>
        ) : (
          <>
            {/* Current Action Banner */}
            {isRunning && currentAction && (
              <div className="p-3 rounded-lg bg-[#e2ff68]/10 border border-[#e2ff68]/20">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#e2ff68] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                  <div>
                    <p className="text-sm text-[#e2ff68] font-medium">{currentAction}</p>
                    <p className="text-xs text-[#8aa860]">Check your wallet for pending transaction</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#8aa860]">Progress</span>
                <span className="text-white">{completed}/{positions.length}{failed > 0 && <span className="text-red-400 ml-1">({failed} failed)</span>}</span>
              </div>
              <div className="h-2 bg-[#1a2310] rounded-full overflow-hidden">
                <div className="h-full bg-[#cfff04] transition-all" style={{ width: `${(completed / positions.length) * 100}%` }} />
              </div>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {progress.map((item) => (
                <div key={item.position.pairAddress} className="flex items-center justify-between p-2.5 rounded bg-[#1a2310]">
                  <div className="flex items-center gap-2">
                    {item.status === "success" && <span className="text-[#cfff04] text-sm">✓</span>}
                    {item.status === "error" && <span className="text-red-400 text-sm">✕</span>}
                    {item.status !== "success" && item.status !== "error" && item.status !== "idle" && (
                      <div className="w-3.5 h-3.5 border-2 border-[#e2ff68] border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} />
                    )}
                    {item.status === "idle" && <span className="w-3.5 h-3.5 rounded-full border border-[#2a3820]" />}
                    <span className="text-sm text-[#e2ff68]">{item.position.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${STATUS_COLOR[item.status]}`}>{STATUS_TEXT[item.status]}</span>
                    {item.txHash && (
                      <a href={EXPLORER.tx(item.txHash)} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#cfff04] hover:underline">
                        tx ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!isRunning && (
              <Button
                onClick={() => { setProgress([]); if (completed > 0 && onSuccess) onSuccess(); }}
                className={completed === positions.length 
                  ? "w-full bg-[#cfff04] text-[#050807] hover:bg-[#d9ff36]" 
                  : "w-full bg-[#1a2310] text-white hover:bg-[#2a3820] border border-[#2a3820]"}
              >
                {completed === positions.length ? "All Complete!" : "Close"}
              </Button>
            )}
          </>
        )}

        {overallError && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400 text-xs">{overallError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Card>
  );
}
