import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a bigint value to a human-readable string with decimals
 */
export function formatTokenAmount(
  amount: bigint | undefined,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  if (!amount) return "0";
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0");
  const displayFraction = fractionStr.slice(0, displayDecimals);

  if (displayFraction === "0".repeat(displayDecimals)) {
    return whole.toString();
  }

  return `${whole}.${displayFraction}`.replace(/\.?0+$/, "");
}

/**
 * Parse a human-readable string to bigint with decimals
 */
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  if (!amount || amount === "") return BigInt(0);

  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const combined = whole + paddedFraction;

  return BigInt(combined);
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Calculate minimum amounts with slippage
 */
export function applySlippage(
  amount: bigint,
  slippagePercent: number
): bigint {
  const slippageBps = BigInt(Math.floor(slippagePercent * 100));
  return (amount * (BigInt(10000) - slippageBps)) / BigInt(10000);
}

/**
 * Calculate the share of tokens from LP tokens
 */
export function calculateTokensFromLP(
  lpAmount: bigint,
  totalSupply: bigint,
  reserve: bigint
): bigint {
  if (totalSupply === BigInt(0)) return BigInt(0);
  return (lpAmount * reserve) / totalSupply;
}

/**
 * Get deadline timestamp (current time + minutes)
 */
export function getDeadline(minutes: number = 20): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + minutes * 60);
}

