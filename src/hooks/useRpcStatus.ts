"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";

export type RpcStatus = "ok" | "lag" | "error" | "checking";

export function useRpcStatus() {
  const [rpcStatus, setRpcStatus] = useState<RpcStatus>("checking");
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const checkRpcStatus = async () => {
      if (!publicClient) {
        setRpcStatus("error");
        return;
      }

      try {
        const start = Date.now();
        const block = await publicClient.getBlockNumber();
        const end = Date.now();
        const responseTime = end - start;

        setBlockNumber(block);
        setLatency(responseTime);

        if (responseTime < 1000) {
          setRpcStatus("ok");
        } else if (responseTime < 3000) {
          setRpcStatus("lag");
        } else {
          setRpcStatus("lag");
        }
      } catch (error) {
        console.error("RPC check failed:", error);
        setRpcStatus("error");
      }
    };

    // Initial check
    checkRpcStatus();

    // Check every 30 seconds
    const interval = setInterval(checkRpcStatus, 30000);

    return () => clearInterval(interval);
  }, [publicClient]);

  return { rpcStatus, blockNumber, latency };
}

