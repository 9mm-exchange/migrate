"use client";

import { useState, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { decodeEventLog } from "viem";
import { PULSEX_PAIR_ABI, V3_MIGRATOR_ABI, POSITION_MANAGER_ABI } from "@/constants/abis";
import {
  NINEMM_CONTRACTS,
  getFullRangeTicks,
} from "@/constants/addresses";
import { applySlippage, getDeadline } from "@/lib/utils";
import type { LPPosition } from "./useLPPositions";
import { useMigratedPositions } from "./useMigratedPositions";

export type MigrationStep =
  | "idle"
  | "approving"
  | "approved"
  | "migrating"
  | "success"
  | "error";

export interface MigrationConfig {
  feeTier: number;
  slippagePercent: number;
}

export interface MigrationResult {
  tokenId: string;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  txHash: string;
  pairName: string;
}

// ABI for the IncreaseLiquidity event from NonfungiblePositionManager
const INCREASE_LIQUIDITY_EVENT = {
  type: "event",
  name: "IncreaseLiquidity",
  inputs: [
    { indexed: true, name: "tokenId", type: "uint256" },
    { indexed: false, name: "liquidity", type: "uint128" },
    { indexed: false, name: "amount0", type: "uint256" },
    { indexed: false, name: "amount1", type: "uint256" },
  ],
} as const;

// ABI for the MigrationCompleted event from our PulseXV3Migrator contract
const MIGRATION_COMPLETED_EVENT = {
  type: "event",
  name: "MigrationCompleted",
  inputs: [
    { indexed: true, name: "user", type: "address" },
    { indexed: true, name: "pair", type: "address" },
    { indexed: false, name: "tokenId", type: "uint256" },
    { indexed: false, name: "liquidity", type: "uint128" },
    { indexed: false, name: "amount0", type: "uint256" },
    { indexed: false, name: "amount1", type: "uint256" },
  ],
} as const;

export function useMigrate() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { addMigratedPosition } = useMigratedPositions();
  const [step, setStep] = useState<MigrationStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Write contract hooks
  const {
    writeContractAsync: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const {
    writeContractAsync: writeMigrate,
    data: migrateHash,
    isPending: isMigratePending,
  } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  const { isLoading: isMigrateConfirming, isSuccess: isMigrateConfirmed } =
    useWaitForTransactionReceipt({
      hash: migrateHash,
    });

  // Approve LP tokens to migrator
  const approve = useCallback(
    async (position: LPPosition): Promise<`0x${string}` | null> => {
      if (!address) {
        setError("Wallet not connected");
        return null;
      }

      try {
        setStep("approving");
        setError(null);

        const hash = await writeApprove({
          address: position.pairAddress,
          abi: PULSEX_PAIR_ABI,
          functionName: "approve",
          args: [NINEMM_CONTRACTS.V3_MIGRATOR, position.balance],
        });

        setStep("approved");
        return hash;
      } catch (err: any) {
        console.error("Approval error:", err);
        setError(err.shortMessage || err.message || "Approval failed");
        setStep("error");
        return null;
      }
    },
    [address, writeApprove]
  );

  // Execute migration
  const migrate = useCallback(
    async (position: LPPosition, config: MigrationConfig): Promise<MigrationResult | null> => {
      if (!address || !publicClient) {
        setError("Wallet not connected");
        return null;
      }

      try {
        setStep("migrating");
        setError(null);

        // Calculate minimum amounts with slippage
        const amount0Min = applySlippage(
          position.userShare0,
          config.slippagePercent
        );
        const amount1Min = applySlippage(
          position.userShare1,
          config.slippagePercent
        );

        // Get correct tick range for this fee tier
        const { minTick, maxTick } = getFullRangeTicks(config.feeTier);

        const params = {
          pair: position.pairAddress,
          liquidityToMigrate: position.balance,
          percentageToMigrate: 100, // Migrate 100% of LP tokens
          token0: position.token0,
          token1: position.token1,
          fee: config.feeTier,
          tickLower: minTick,
          tickUpper: maxTick,
          amount0Min,
          amount1Min,
          recipient: address,
          deadline: getDeadline(20), // 20 minutes deadline
          refundAsETH: false, // Return dust as ERC20, not ETH
        };

        const hash = await writeMigrate({
          address: NINEMM_CONTRACTS.V3_MIGRATOR,
          abi: V3_MIGRATOR_ABI,
          functionName: "migrate",
          args: [params],
        });

        // Wait for transaction receipt with retries (PulseChain can be slow)
        const receipt = await publicClient.waitForTransactionReceipt({ 
          hash,
          confirmations: 2, // Wait for 2 confirmations for safety
          timeout: 120_000, // 2 minutes timeout (PulseChain can be slow)
          pollingInterval: 2_000, // Check every 2 seconds
        });

        // Try to extract tokenId from logs
        let tokenId: string | null = null;
        let liquidity = "0";

        for (const log of receipt.logs) {
          try {
            // First, look for our MigrationCompleted event from PulseXV3Migrator
            if (log.address.toLowerCase() === NINEMM_CONTRACTS.V3_MIGRATOR.toLowerCase()) {
              const decoded = decodeEventLog({
                abi: [MIGRATION_COMPLETED_EVENT],
                data: log.data,
                topics: log.topics,
              });
              
              if (decoded.eventName === "MigrationCompleted") {
                tokenId = (decoded.args as any).tokenId.toString();
                liquidity = (decoded.args as any).liquidity.toString();
                break;
              }
            }
            // Fallback: Look for IncreaseLiquidity event from Position Manager
            if (log.address.toLowerCase() === NINEMM_CONTRACTS.POSITION_MANAGER.toLowerCase()) {
              const decoded = decodeEventLog({
                abi: [INCREASE_LIQUIDITY_EVENT],
                data: log.data,
                topics: log.topics,
              });
              
              if (decoded.eventName === "IncreaseLiquidity") {
                tokenId = (decoded.args as any).tokenId.toString();
                liquidity = (decoded.args as any).liquidity.toString();
                // Don't break here, prefer MigrationCompleted if found later
              }
            }
          } catch {
            // Continue to next log
          }
        }

        const result: MigrationResult = {
          tokenId: tokenId || "unknown",
          token0: position.token0,
          token1: position.token1,
          fee: config.feeTier,
          tickLower: minTick,
          tickUpper: maxTick,
          liquidity,
          txHash: hash,
          pairName: position.name,
        };

        // Save to local storage for tracking
        addMigratedPosition(result);

        setMigrationResult(result);
        setStep("success");
        return result;
      } catch (err: any) {
        console.error("Migration error:", err);
        setError(err.shortMessage || err.message || "Migration failed");
        setStep("error");
        return null;
      }
    },
    [address, publicClient, writeMigrate, addMigratedPosition]
  );

  // Combined approve and migrate
  const approveAndMigrate = useCallback(
    async (position: LPPosition, config: MigrationConfig): Promise<MigrationResult | null> => {
      if (!publicClient) {
        setError("Public client not available");
        return null;
      }

      // Step 1: Approve and get the transaction hash
      const txHash = await approve(position);
      if (!txHash) return null;

      // Step 2: Wait for approval transaction to be confirmed
      try {
        setStep("approved");
        await publicClient.waitForTransactionReceipt({ 
          hash: txHash,
          confirmations: 2, // Wait for 2 confirmations
          timeout: 120_000, // 2 minutes timeout
          pollingInterval: 2_000, // Check every 2 seconds
        });
      } catch (err) {
        console.error("Error waiting for approval confirmation:", err);
        setError("Approval transaction failed or timed out. Please check your wallet.");
        setStep("error");
        return null;
      }

      // Step 3: Migrate
      return migrate(position, config);
    },
    [approve, migrate, publicClient]
  );

  // Reset state
  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setMigrationResult(null);
  }, []);

  return {
    step,
    error,
    approveHash,
    migrateHash,
    migrationResult,
    isApprovePending,
    isMigratePending,
    isApproveConfirming,
    isMigrateConfirming,
    isApproveConfirmed,
    isMigrateConfirmed,
    approve,
    migrate,
    approveAndMigrate,
    reset,
  };
}
